from flask import jsonify, request
from datetime import datetime, timedelta
from collections import defaultdict
from app.models.db import get_db_connection
"""from app.models.vm_model import get_all_vm_ips
from app.services.alert_service import get_sanitized_metrics
"""
def register_availability_routes(app):
    @app.route("/api/availability", methods=["GET"])
    def get_availability():
        # 1. Define observation window
        window_days = int(request.args.get("days", 7))
        window_start = datetime.now() - timedelta(days=window_days)
        window_seconds = window_days * 24 * 3600

        conn = get_db_connection()
        cursor = conn.cursor()

    # 2. Get alerts
        cursor.execute("""
        SELECT id, vm_ip, timestamp
        FROM alerts
        WHERE level = 'critical' AND timestamp >= ?
    """, (window_start,))
        alerts = cursor.fetchall()

    # 3. Get tickets (completed only)
        cursor.execute("""
        SELECT alert_id, created_at
        FROM tickets
        WHERE status = 'completed'
    """)
        ticket_rows = cursor.fetchall()

    # 4. Build ticket lookup
        ticket_lookup = {alert_id: created_at for (alert_id, created_at) in ticket_rows}

    # 5. Calculate downtime per VM
        vm_downtime = defaultdict(float)

        for alert_id, vm_ip, alert_time in alerts:
            resolved_time = ticket_lookup.get(alert_id, datetime.now())
            downtime = (resolved_time - alert_time).total_seconds()
            vm_downtime[vm_ip] += downtime

    # 6. Prepare response
        result = []
        for vm_ip, total_downtime in vm_downtime.items():
            availability = (1 - total_downtime / window_seconds) * 100
            result.append({
            "vm_ip": vm_ip,
            "availability": round(availability, 2),
            "downtime_seconds": int(total_downtime),
            "observation_window_seconds": window_seconds
        })

        return jsonify(result)
    