from apscheduler.schedulers.background import BackgroundScheduler
import requests
from datetime import datetime,timedelta
from app.models.db import get_db_connection
from collections import defaultdict
from app.models.alert_model import insert_alert_record
from app.services.alert_service import ALERT_THRESHOLDS_CONFIG,evaluate_alerts,get_sanitized_metrics

scheduler = BackgroundScheduler()

def start_monitoring_scheduler():
    scheduler.add_job(check_vm_alerts, 'interval', seconds=60, id='vm_alert_monitor')
    scheduler.start()
    print("✅ Monitoring scheduler started.")

def check_vm_alerts():
    print(f"\n🕒 in monitoring servChecking VM alerts at {datetime.now()}")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ip FROM VMs WHERE is_monitored = 1")
    vm_rows = cursor.fetchall()
    conn.close()

    for row in vm_rows:
        vm_ip = row[0]
        try:
            metrics = get_sanitized_metrics(vm_ip)
            if metrics:
                print(f"📊 Sanitized metrics from {vm_ip}: {metrics}")
                evaluate_alerts(vm_ip, metrics)
            else:
                print(f"⚠️ Failed to parse or sanitize metrics from {vm_ip}")
        except Exception as e:
            print(f"❌ Could not fetch metrics from {vm_ip}: {e}")



def compute_availability(window_days=7):
    window_start = datetime.now() - timedelta(days=window_days)
    window_seconds = window_days * 24 * 3600

    conn = get_db_connection()
    cursor = conn.cursor()

        # Step 1: Get critical alerts
    cursor.execute("""
            SELECT id, vm_ip, timestamp
            FROM alerts
            WHERE level = 'critical' AND timestamp >= ?
        """, (window_start,))
    alerts = cursor.fetchall()

        # Step 2: Get completed tickets
    cursor.execute("""
            SELECT alert_id, created_at
            FROM tickets
            WHERE status = 'completed'
        """)
    ticket_rows = cursor.fetchall()
    ticket_lookup = {alert_id: created_at for (alert_id, created_at) in ticket_rows}

        # Step 3: Calculate downtime
    vm_downtime = defaultdict(float)

    for alert_id, vm_ip, alert_time in alerts:
        resolved_time = ticket_lookup.get(alert_id, datetime.now())
        downtime = (resolved_time - alert_time).total_seconds()
        vm_downtime[vm_ip] += downtime

        # Step 4: Calculate availability per VM
    result = []
    for vm_ip, total_downtime in vm_downtime.items():
        availability = (1 - total_downtime / window_seconds) * 100
        result.append({
                "vm_ip": vm_ip,
                "availability": round(availability, 2),
                "downtime_seconds": int(total_downtime),
                "observation_window_seconds": window_seconds
            })

    return result