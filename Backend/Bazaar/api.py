from fastapi import FastAPI, HTTPException # fastapi
from Database import redis_client, postgres_client # call redis client so we can it, call postgres client so that we can use it
import requests # requests to pull from hypixel api
from datetime import datetime, timezone # to get current time
import psycopg

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

    # postgres 
    try:
        with psycopg.connect(postgres_client.connection_string) as conn: # connecting to postgresql database
            with conn.cursor() as cursor:
                cursor.executemany(
                    """
                    UPDATE bazaar_items
                    SET valid_period = tstzrange(
                        lower(valid_period),
                        %s,
                        '[)'
                    )
                    WHERE item_name = %s
                      AND upper_inf(valid_period)
                      AND lower(valid_period) < %s
                """,
                    [(now, record[0], now) for record in records],
                )

                # Insert new active periods
                cursor.executemany(
                    """
                    INSERT INTO bazaar_items (
                        item_name,
                        buy_price,
                        sell_price,
                        buy_volume,
                        sell_volume,
                        buy_orders,
                        sell_orders,
                        valid_period
                    )
                    VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        tstzrange(%s, NULL, '[)')
                    )
                """,
                    [(*record, now) for record in records],
                )

    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail=f"PostgreSQL error: {error}")

# redis caching
    try:
            with redis_client.client.pipeline() as pipe:
                for product_id, fields in result.items():
                    pipe.hset(product_id, mapping=fields)
                pipe.execute()

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Redis error: {error}"
        )

    return {
        "message": "Bazaar data refreshed",
        "items_processed": len(result),
        "timestamp": now.isoformat()
    }


# retrieves a specific item
@app.get("/items/{query}")
def getItem():
    # check cache if data is there
    # if so return it
    # if not retrieve from API, 
    return ''
