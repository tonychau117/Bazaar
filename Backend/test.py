import requests

url = "https://api.hypixel.net/v2/skyblock/bazaar"

data = requests.get(url).json()

result = {}

for product_id, product in data["products"].items(): # loops through all bz products, returns prod_id + prod data
    status = product["quick_status"] # easier access to quick status data, assigns all data to status

    # key value pairs of item
    # gets respective values from calls
    result[product_id] = {
        "buy_price": status["buyPrice"],
        "sell_price": status["sellPrice"],
        "buy_volume": status["buyVolume"],
        "sell_volume": status["sellVolume"],
        "buy_orders": status["buyOrders"],
        "sell_orders": status["sellOrders"],
    }

print(result["ABSOLUTE_ENDER_PEARL"])
