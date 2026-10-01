from fastapi import FastAPI # fastapi
from Database import redis_client # call redis client so we can it
from Database import postgres_client # call postgres client so that we can use it
import requests # requests to pull from hypixel api
from datetime import datetime # to get current time

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

    redis_client.client.set(product_id, result[product_id]) # sets the data in cache
    # we dont care about historical data for this, just the now

    # next we write the data in postgresql for historical data in order to make comparisons later on
    '''
        postgres_client.conn.execute("""
            INSERT INTO bazaar_items ()
        
        
        )
    '''
    
    
    

# retrieves a specific item
@app.get("/items/{query}")
def getItem():
    # check cache if data is there
    # if so return it
    # if not retrieve from API, 
    return ''
