import psutil

def collect_metrics():
    return {
        "cpu": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("C:\\").percent,
        "net_io": psutil.net_io_counters()._asdict()
    }
