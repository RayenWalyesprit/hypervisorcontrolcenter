
import pyodbc
def get_db_connection_static():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=DESKTOP-HS09C3H;"
        "DATABASE=delice_internship;"
        "UID=delicerayen;"
        "PWD=delicerayen1"
    )

def get_sql_server_config():
    conn = get_db_connection_static()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT TOP 1 server, database_name, username, password FROM SQLConfig ORDER BY created_at DESC")
        row = cursor.fetchone()
        if row:
            return {
                "server": row.server,
                "database": row.database_name,
                "username": row.username,
                "password": row.password
            }
    except Exception as e:
        print("❌ Error fetching SQL config:", e)
    finally:
        cursor.close()
        conn.close()
    return None

def get_db_connection():
    config = get_sql_server_config()
    if not config:
        print("❌ No dynamic SQL config found.")
        return None

    try:
        conn = pyodbc.connect(
            f"DRIVER={{SQL Server}};"
            f"SERVER={config['server']};"
            f"DATABASE={config['database']};"
            f"UID={config['username']};"
            f"PWD={config['password']}"
        )
        return conn
    except Exception as e:
        print(f"❌ Database connection error (dynamic config): {e}")
        return None

# Example DB helper method (optional, expand as needed)
def insert_user(username, full_name, email, role="Viewer"):
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO AppUsers (username, full_name, email, role) VALUES (?, ?, ?, ?)",
            (username, full_name, email, role)
        )
        conn.commit()
        return True
    except Exception as e:
        print("❌ Error inserting user:", e)
        return False
    finally:
        conn.close()
