import psycopg # allows us to use python to use pstofresql

# connection to the database
connection_string = (
    "dbname=mydatabase "
    "user=myuser "
    "password=mysecretpassword "
    "host=localhost "
    "port=5432 "
)

# creating a table based on our API pull
# create a temporal table to track changes
create_bz_table = """
CREATE TABLE IF NOT EXISTS bazaar_items (
    item_name VARCHAR(50) NOT NULL,
    buy_price NUMERIC(20, 4) NOT NULL,
    sell_price NUMERIC(20, 4) NOT NULL,
    buy_volume BIGINT NOT NULL,
    sell_volume BIGINT NOT NULL,
    buy_orders INTEGER NOT NULL,
    sell_orders INTEGER NOT NULL,
    valid_period TSTZRANGE NOT NULL,

    PRIMARY KEY (item_name, valid_period WITHOUT OVERLAPS)
);
"""

# creating the table
try:
    with psycopg.connect(connection_string) as conn:
        with conn.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
            cursor.execute(create_bz_table)
except psycopg.Error as error:
    print("Table already exists")

