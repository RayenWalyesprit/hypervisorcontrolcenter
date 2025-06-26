import win32serviceutil
import win32service
import win32event
import servicemanager
import threading
import time

from agent.metrics_collector import collect_metrics
from agent.sender import send_metrics
from agent.config import POLL_INTERVAL_SECONDS

class MonitoringAgent(win32serviceutil.ServiceFramework):
    _svc_name_ = "MyMonitoringAgent"
    _svc_display_name_ = "Custom Monitoring Agent Service"

    def __init__(self, args):
        super().__init__(args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.running = True

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        self.running = False

    def SvcDoRun(self):
        servicemanager.LogInfoMsg("MonitoringAgent service started.")
        self.main()

    def main(self):
        while self.running:
            metrics = collect_metrics()
            send_metrics(metrics)
            time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    win32serviceutil.HandleCommandLine(MonitoringAgent)
