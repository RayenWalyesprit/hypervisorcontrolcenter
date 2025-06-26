from flask import Blueprint, jsonify
from app.models.vm_model import get_all_vms
from app.models.alert_model import get_all_alerts_from_db

from app.services.alert_service import get_sanitized_metrics
from app.services.monitoring_service import compute_availability
from datetime import datetime
from statistics import mean

def register_dashboard_routes(app):
    @app.route("/api/dashboard", methods=["GET"])
    def dashboard():
        vms = get_all_vms()
        vm_ips = [vm['ip'] for vm in vms]

        # Initialize storage
        cpu_vals = []
        mem_used_vals = []
        mem_total_vals = []
        disk_vals = []

        cpu_series = []
        mem_series = []
        disk_series = []

        for ip in vm_ips:
            metrics = get_sanitized_metrics(ip)
            if not metrics:
                continue

            # Parse metrics
            cpu = float(metrics.get("cpu_usage_percent", 0))
            mem_used = float(metrics.get("memory_used_mb", 0)) / 1024
            mem_total = float(metrics.get("memory_total_mb", 1)) / 1024
            disk = float(metrics.get("disk_active_percent", 0))

            cpu_vals.append(cpu)
            mem_used_vals.append(mem_used)
            mem_total_vals.append(mem_total)
            disk_vals.append(disk)

            timestamp = datetime.now().isoformat()
            cpu_series.append({"timestamp": timestamp, "value": cpu})
            mem_series.append({"timestamp": timestamp, "value": mem_used})
            disk_series.append({"timestamp": timestamp, "value": disk})

        # Availability
        # Ideally you import and call the internal function used in /api/availability
        try:
            availability_data = compute_availability(window_days=7)
        except:
            availability_data = []

        avg_avail = (
            sum(x["availability"] for x in availability_data) / len(availability_data)
            if availability_data else 0
        )
        total_downtime = sum(x["downtime_seconds"] for x in availability_data)

        availability = {
            "percentage": round(avg_avail, 2),
            "totalDowntimeHours": round(total_downtime / 3600, 2),
            "monitoredVMs": len(availability_data)
        }

        usage = {
            "cpu": {
                "percentage": round(mean(cpu_vals), 2) if cpu_vals else 0,
                "peak": max(cpu_vals) if cpu_vals else 0,
                "trend": 0.0  # placeholder
            },
            "memory": {
                "percentage": round(
                    mean([(u / t) * 100 for u, t in zip(mem_used_vals, mem_total_vals)])
                    if mem_total_vals else 0, 2
                ),
                "available": f"{round(sum(t - u for u, t in zip(mem_used_vals, mem_total_vals)), 2)} GiB",
                "total": f"{round(sum(mem_total_vals), 2)} GiB",
                "trend": 0.0
            },
            "storage": {
                "percentage": round(mean(disk_vals), 2) if disk_vals else 0,
                "used": "N/A",  # disk_used_kbps can be added later
                "capacity": "N/A",
                "trend": 0.0
            }
        }

        performance = {
            "cpu": cpu_series,
            "memory": mem_series,
            "disk": disk_series
        }

        summary = {
            "dataCenters": 1,
            "clusters": 1,
            "hosts": 1,
            "storageDomains": 1,
            "virtualMachines": len(vm_ips)
        }

        alerts = get_all_alerts_from_db()

        return jsonify({
            "summary": summary,
            "availability": availability,
            "performance": performance,
            "usage": usage,
            "alerts": alerts
        })
