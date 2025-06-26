from datetime import datetime
from app.models.db import get_db_connection

def create_ticket(data):
    alert_id = data.get("alert_id")
    assigned_user_id = data.get("assigned_user_id")
    description = data.get("description")

    if not all([alert_id, assigned_user_id, description]):
        return {"error": "Missing fields"}, 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT username FROM AppUsers WHERE id = ?", (assigned_user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            return {"error": "Assigned user not found"}, 404

        assigned_user = user_row.username
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        cursor.execute("""
            INSERT INTO Tickets (alert_id, assigned_user, assigned_user_id, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (alert_id, assigned_user, assigned_user_id, description, 'open', created_at))

        cursor.execute("DELETE FROM Alerts WHERE id = ?", (alert_id,))
        conn.commit()
        return {"message": "Ticket created successfully"}, 201
    except Exception as e:
        print(f"❌ Error creating ticket: {e}")
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

def get_user_tickets(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, alert_id, assigned_user, description, status, created_at
        FROM Tickets
        WHERE assigned_user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))
    
    rows = cursor.fetchall()
    tickets = [
        {
            "id": row.id,
            "alert_id": row.alert_id,
            "assigned_to": row.assigned_user,
            "description": row.description,
            "status": row.status,
            "created_at": row.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for row in rows
    ]
    conn.close()
    return tickets

def complete_ticket(ticket_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Tickets SET status = 'completed' WHERE id = ?", (ticket_id,))
        conn.commit()
        return {"message": "Ticket marked as completed"}, 200
    except Exception as e:
        print(f"Error completing ticket: {e}")
        return {"error": "Failed to complete ticket"}, 500
    finally:
        conn.close()
