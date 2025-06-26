from app.models.db import get_db_connection

def user_exists_in_db(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM AppUsers WHERE username = ?", (username,))
    exists = cursor.fetchone()[0] > 0
    conn.close()
    return exists

def get_user_id_by_username(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM AppUsers WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return row.id if row else None

def insert_user(username, full_name, email, role="Viewer"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO AppUsers (username, full_name, email, role)
        VALUES (?, ?, ?, ?)
    """, (username, full_name, email, role))
    conn.commit()
    conn.close()

def get_all_app_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, full_name, email, role FROM AppUsers")
    rows = cursor.fetchall()
    conn.close()
    return [dict(zip([col[0] for col in cursor.description], row)) for row in rows]
