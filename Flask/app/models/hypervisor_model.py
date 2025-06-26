from app.models.db import get_db_connection

def get_all_hypervisors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, ip_address, username, password FROM Hypervisors")
    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    conn.close()
    return [dict(zip(columns, row)) for row in rows]

def get_hypervisor_by_id(hv_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, ip_address, username, password FROM Hypervisors WHERE id = ?", (hv_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(zip([col[0] for col in cursor.description], row))
    return None

def insert_hypervisor_record(data):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Hypervisors (name, ip_address, username, password, created_at)
            VALUES (?, ?, ?, ?, GETDATE())
        """, (data["name"], data["ip_address"], data["username"], data["password"]))
        conn.commit()
        return {"message": "Hypervisor added"}
    except Exception as e:
        print("❌ Error inserting hypervisor:", e)
        return {"error": str(e)}
    finally:
        conn.close()
