from app.models.db import get_db_connection

def insert_alert_record(hypervisor_id, vm_ip, resource_type, level, value, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    print(f"💾 INSERT ALERT: {message}")
    cursor.execute("""
        INSERT INTO Alerts (hypervisor_id, vm_ip, resource_type, level, value, message)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (hypervisor_id, vm_ip, resource_type, level, value, message))
    conn.commit()
    conn.close()

def get_all_alerts_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Alerts ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    columns = [col[0] for col in cursor.description]
    conn.close()
    return [dict(zip(columns, row)) for row in rows]

def get_latest_critical_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT TOP 1 * FROM Alerts
        WHERE level = 'critical'
        ORDER BY timestamp DESC
    """)
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {}
    alert = dict(zip([col[0] for col in cursor.description], row))
    conn.close()
    return alert

def get_alerts_within_days(days):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM Alerts
        WHERE timestamp >= DATEADD(DAY, -?, GETDATE())
    """, (days,))
    rows = cursor.fetchall()
    columns = [col[0] for col in cursor.description]
    conn.close()
    return [dict(zip(columns, row)) for row in rows]
