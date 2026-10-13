from fastapi import Body, FastAPI, HTTPException # provides request body parsing, route registration, and HTTP errors
from Database import redis_client, postgres_client # call redis client so we can it, call postgres client so that we can use it
import requests # requests to pull from hypixel api
from datetime import datetime, timezone # to get current time
import psycopg
from redis.exceptions import RedisError # identifies errors raised by the Redis client

app = FastAPI() # creating api
url = "https://api.hypixel.net/v2/skyblock/bazaar"
now = datetime.now()

# getting items -> cache to redis and write to SQL backend db for storage
# this is going to run on startup for initial prices on current time
# only retrieves new prices when requested or we can run it async in the back in given intervals
@app.get("/items") # url
def loadData():
    # store the data as json
    data = requests.get(url).json()
    result = {} # empty hashmap to store kv pairs

    for product_id, product in data["products"].items(): # loops through each item in the bz list
        status = product["quick_status"] # gets the item's quick status, easier to access endpoints (see below)

        result[product_id] = { # prodID : quick status returned values
            "buy_price": status["buyPrice"],
            "sell_price": status["sellPrice"],
            "buy_volume": status["buyVolume"],
            "sell_volume": status["sellVolume"],
            "buy_orders": status["buyOrders"],
            "sell_orders": status["sellOrders"],
        }

    now = datetime.now(timezone.utc) # gets the current time in UTC tz

    # prepping postgresql data
    records = [
        (
            product_id,
            item["buy_price"],
            item["sell_price"],
            item["buy_volume"],
            item["sell_volume"],
            item["buy_orders"],
            item["sell_orders"],
        )
        for product_id, item in result.items()
    ]

    # saves the refreshed prices in PostgreSQL while preserving previous price records
    try: # handles database errors from either updating old records or inserting new ones
        with psycopg.connect(postgres_client.connection_string) as conn: # opens a connection; commits on successful exit or rolls back on error
            with conn.cursor() as cursor: # opens a cursor to execute SQL and closes it when this block ends
                cursor.executemany( # runs the following update once for each product's parameter tuple
                    """ -- begins the SQL statement that closes each product's previous active period
                    UPDATE bazaar_items -- updates matching rows in the price history table
                    SET valid_period = tstzrange( -- replaces the row's validity period with a timestamp range
                        lower(valid_period), -- preserves the original start time of this price record
                        %s, -- uses the first supplied parameter, now, as the end time
                        '[)' -- includes the start time and excludes the end time to avoid overlapping periods
                    ) -- finishes constructing the replacement validity range
                    WHERE item_name = %s -- selects the product identified by the second supplied parameter
                      AND upper_inf(valid_period) -- selects only records with no upper bound, meaning they are still active
                      AND lower(valid_period) < %s -- requires the start time to precede now so the closed range is not empty
                """, # ends the parameterized update statement
                    [(now, record[0], now) for record in records], # supplies the end time, product ID, and comparison time for each product
                ) # finishes the batch update that closes previous active periods

                # inserts a new active price record for each product using the same refresh time
                cursor.executemany( # runs the following insert once for each product's parameter tuple
                    """ -- begins the SQL statement that stores the newly refreshed prices
                    INSERT INTO bazaar_items ( -- inserts a row into the price history table using these columns
                        item_name, -- stores the product ID
                        buy_price, -- stores the refreshed buy price
                        sell_price, -- stores the refreshed sell price
                        buy_volume, -- stores the refreshed buy volume
                        sell_volume, -- stores the refreshed sell volume
                        buy_orders, -- stores the refreshed number of buy orders
                        sell_orders, -- stores the refreshed number of sell orders
                        valid_period -- stores the time range during which this price record is active
                    ) -- finishes the list of columns receiving values
                    VALUES ( -- begins the values supplied for the listed columns in matching order
                        %s, %s, %s, %s, -- supplies the product ID, buy price, sell price, and buy volume
                        %s, %s, %s, -- supplies the sell volume, buy order count, and sell order count
                        tstzrange(%s, NULL, '[)') -- creates a range starting at now with no upper bound, marking this record active
                    ) -- finishes the values for the new price record
                """, # ends the parameterized insert statement
                    [(*record, now) for record in records], # unpacks each product's seven fields and appends its validity start time
                ) # finishes the batch insert of new active price records

    except psycopg.Error as error: # catches database connection, SQL, or transaction failures
        raise HTTPException(status_code=500, detail=f"PostgreSQL error: {error}") # returns an HTTP 500 response containing the database error

    # caches each product's refreshed fields in Redis after PostgreSQL succeeds
    try: # handles failures while queuing or executing the cache writes
            with redis_client.client.pipeline() as pipe: # opens a pipeline that batches commands in a Redis transaction by default
                for product_id, fields in result.items(): # loops through each product ID and its refreshed fields
                    pipe.hset(product_id, mapping=fields) # queues a hash update under the product ID without sending it yet
                pipe.execute() # sends and executes the queued hash updates in Redis

    except Exception as error: # catches exceptions raised while writing the Redis cache
        raise HTTPException( # constructs the HTTP error returned when the cache refresh fails
            status_code=500, # marks the response as an internal server error
            detail=f"Redis error: {error}" # includes the cache error in the response details
        ) # raises the completed HTTP exception and stops the request

    return { # returns a success response after both database and cache writes complete
        "message": "Bazaar data refreshed", # confirms that the refresh succeeded
        "items_processed": len(result), # reports the number of products processed in this refresh
        "timestamp": now.isoformat() # formats the UTC refresh time as an ISO 8601 string
    } # finishes the response dictionary that FastAPI serializes to JSON


def getCachedItem(query: str): # shares query validation and cache retrieval between both endpoints
    product_id = "_".join(query.split()).upper() # trims whitespace, joins words with underscores, and capitalizes the product ID
    if not product_id: # rejects a query containing only whitespace
        raise HTTPException(status_code=400, detail="Query must contain a product ID") # reports an invalid query
    try: # attempts to read the product's current cached fields
        cached_item = redis_client.client.hgetall(product_id) # retrieves the Redis hash using the normalized product ID
    except RedisError as error: # handles Redis connection and command failures
        raise HTTPException(status_code=503, detail="Redis cache unavailable") from error # reports a temporary cache failure
    if not cached_item: # treats a product ID without cached fields as an unavailable item
        raise HTTPException(status_code=404, detail="Item not found in cache") # reports an unknown or uncached product ID
    return cached_item # returns the stored fields and values as JSON


@app.get("/items/{query}") # registers the GET lookup with the query in the URL path
def getItem(query: str): # accepts a product ID or a name containing spaces as a string
    return getCachedItem(query) # validates the query and returns the current cached fields


@app.post("/items") # registers the POST lookup with the query submitted as plain text
def postItem(query: str = Body(..., media_type="text/plain")): # reads the required string directly from the request body
    return getCachedItem(query) # normalizes the submitted text and returns its cached fields
