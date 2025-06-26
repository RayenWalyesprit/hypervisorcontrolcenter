import requests
from app.models.alert_model import (
    get_all_alerts_from_db,
    get_latest_critical_from_db,
    insert_alert_record,
    get_alerts_within_days
)
from app.models.db import get_db_connection
import requests
import json
import re

def get_sanitized_metrics(vm_ip):
    try:
        response = requests.get(f"http://{vm_ip}:9001/metrics/", timeout=5)
        raw = response.text
        print(f"🐞 Raw response from {vm_ip}:\n{raw[:100]}...")
        sanitized = re.sub(r'(\d),(\d)', r'\1.\2', raw)
        metrics = json.loads(sanitized)
        return metrics

    except Exception as e:
        print(f"❌ Error fetching/sanitizing JSON from {vm_ip}: {e}")
        return {}

ALERT_THRESHOLDS = {
    "cpu": {"warning": 1, "critical": 90.0, "duration": 1},      # percentages
    "memory": {"warning": 1, "critical": 90.0, "duration": 1},   # percentages
    "disk": {"warning": 1, "critical": 80.0, "duration": 1}      # percentages
}
ALERT_THRESHOLDS_CONFIG = ALERT_THRESHOLDS.copy()


def get_all_alerts():
    return get_all_alerts_from_db()


def get_latest_critical_alert():
    return get_latest_critical_from_db()


def simulate_alert(data):
    vm_ip = data.get("vm_ip", "TestVM")
    resource = data.get("resource", "cpu")
    level = data.get("level", "warning").lower()
    value = data.get("value", 95.0)

    if level not in ["warning", "critical"]:
        return {"error": "Invalid alert level"}

    message = f"{resource.upper()} {level.upper()} alert for {vm_ip}: {value}%"
    insert_alert_record(0, vm_ip, resource, level, value, message)
    return {"message": "Simulated alert inserted", "alert": message}


def get_alert_summary(days):
    alerts = get_alerts_within_days(days)
    by_level, by_resource, top_vms = {}, {}, {}

    for alert in alerts:
        level = alert["level"]
        resource = alert["resource_type"]
        vm_ip = alert["vm_ip"]

        by_level[level] = by_level.get(level, 0) + 1
        by_resource[resource] = by_resource.get(resource, 0) + 1
        top_vms[vm_ip] = top_vms.get(vm_ip, 0) + 1

    top_vms_sorted = sorted(top_vms.items(), key=lambda x: x[1], reverse=True)[:3]

    return {
        "by_level": by_level,
        "by_resource": by_resource,
        "top_vms": [{"vm_ip": ip, "alert_count": count} for ip, count in top_vms_sorted]
    }


def get_alert_thresholds():
    return ALERT_THRESHOLDS_CONFIG


def update_alert_thresholds(data):
    try:
        for resource in ["cpu", "memory", "disk"]:
            for level in ["warning", "critical", "duration"]:
                if level in data.get(resource, {}):
                    ALERT_THRESHOLDS_CONFIG[resource][level] = float(data[resource][level])
        return {"message": "Thresholds updated"}
    except Exception as e:
        return {"error": str(e)}


def evaluate_alerts(vm_ip, metrics):
    thresholds = ALERT_THRESHOLDS_CONFIG
    cpu = metrics.get("cpu_usage_percent", 0)
    memory = metrics.get("memory_usage_percent", 0)
    disk = metrics.get("disk_active_percent", 0)

    print(f"🔍 Evaluating {vm_ip}: CPU={cpu}%, MEM={memory}%, DISK={disk}%")

    if cpu >= thresholds["cpu"]["critical"]:
        print("🚨 CPU CRITICAL triggered")
        insert_alert_record(0, vm_ip, "cpu", "critical", cpu, f"CPU CRITICAL alert for {vm_ip}: {cpu}%")
    elif cpu >= thresholds["cpu"]["warning"]:
        print("⚠️ CPU WARNING triggered")
        insert_alert_record(0, vm_ip, "cpu", "warning", cpu, f"CPU WARNING alert for {vm_ip}: {cpu}%")

    if memory >= thresholds["memory"]["critical"]:
        print("🚨 MEM CRITICAL triggered")
        insert_alert_record(0, vm_ip, "memory", "critical", memory, f"Memory CRITICAL alert for {vm_ip}: {memory}%")
    elif memory >= thresholds["memory"]["warning"]:
        print("⚠️ MEM WARNING triggered")
        insert_alert_record(0, vm_ip, "memory", "warning", memory, f"Memory WARNING alert for {vm_ip}: {memory}%")

    if disk >= thresholds["disk"]["critical"]:
        print("🚨 DISK CRITICAL triggered")
        insert_alert_record(0, vm_ip, "disk", "critical", disk, f"Disk CRITICAL alert for {vm_ip}: {disk}%")
    elif disk >= thresholds["disk"]["warning"]:
        print("⚠️ DISK WARNING triggered")
        insert_alert_record(0, vm_ip, "disk", "warning", disk, f"Disk WARNING alert for {vm_ip}: {disk}%")
