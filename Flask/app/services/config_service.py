from app.models.db import get_db_connection_static

def get_ad_config():
    conn = get_db_connection_static()
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 1 server, base_dn, username, password FROM ADConfig ORDER BY created_at DESC")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "server": row.server,
        "base_dn": row.base_dn,
        "username": row.username,
        "password": row.password
    }

def update_ad_config(data):
    conn = get_db_connection_static()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO ADConfig (server, base_dn, username, password, created_at)
            VALUES (?, ?, ?, ?, GETDATE())
        """, (data["server"], data["base_dn"], data["username"], data["password"]))
        conn.commit()
        return {"message": "AD config updated"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

def get_sql_config():
    conn = get_db_connection_static()
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 1 server, database_name, username, password FROM SQLConfig ORDER BY created_at DESC")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "server": row.server,
        "database": row.database_name,
        "username": row.username,
        "password": row.password
    }

def update_sql_config(data):
    conn = get_db_connection_static()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO SQLConfig (server, database_name, username, password, created_at)
            VALUES (?, ?, ?, ?, GETDATE())
        """, (data["server"], data["database"], data["username"], data["password"]))
        conn.commit()
        return {"message": "SQL config updated"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()
