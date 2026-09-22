import psycopg

# Connect to the default 'postgres' database to execute the creation command
conn = psycopg.connect(
    dbname="mydatabase",
    user="myuser",
    password="mysecretpassword",
    host="localhost",
    port="5432",
    autocommit=True,  # Critical: Must be set to True
)

try:
    with conn.cursor() as cursor:
        # Execute the database creation query
        cursor.execute("CREATE DATABASE my_new_database;")
        print("Database 'my_new_database' created successfully!")
except psycopg.errors.DuplicateDatabase:
    print("Database already exists.")
finally:
    conn.close()
