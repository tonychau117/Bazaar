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
create_bz_table = """

CREATE TABLE IF NOT EXISTS (

item_name VARCHAR(50) PRIMARY KEY NOT NULL,
buy_price integer,
sell_price integer,
buy_volume integer, 
sell_volume integer,
buy_order integer,
sell_order integer
)
"""

# creating the database
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

# creating the table
try:
    with conn.cursor() as cursor:
        cursor.execute("CREATE TABLE create_bz_table")
        print("Table created")
except psycopg.errors.DuplicateTable:
    print("Table already exists")
finally:
    conn.close()