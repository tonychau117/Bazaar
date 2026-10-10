import psycopg # allows us to use python to use pstofresql

# Connect to the default 'postgres' database to execute the creation command
conn = psycopg.connect(
    dbname="mydatabase",
    user="myuser",
    password="mysecretpassword",
    host="localhost",
    port="5432",
    autocommit=True,  # Critical: Must be set to True
)

# creating a table based on our API pull
# create a temporal table to track changes
create_bz_table = """

CREATE TABLE IF NOT EXISTS bazaar_items(

item_name VARCHAR(50) NOT NULL,
buy_price integer NOT NULL,
sell_price integer NOT NULL,
buy_volume integer NOT NULL, 
sell_volume integer NOT NULL,
buy_order integer NOT NULL,
sell_order integer NOT NULL,
valid_period tstzrange NOT NULL, 

PRIMARY KEY (item_name, valid_period WITHOUT OVERLAPS)
)
"""

# def createDatabase():  # creating the database
try:
    # cursor allows us to perform database operations
    with conn.cursor() as cursor:
        # Execute the database creation query
        cursor.execute("CREATE DATABASE my_new_database;")
        print("Database 'my_new_database' created successfully!")
except psycopg.errors.DuplicateDatabase:
    print("Database already exists.")
finally:
    conn.close()

#def createTable(): # creating the table
try:
    with conn.cursor() as cursor:
        cursor.execute("CREATE TABLE create_bz_table")
        print("Table created")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
except psycopg.errors.DuplicateTable:
    print("Table already exists")
finally:
    conn.close()
