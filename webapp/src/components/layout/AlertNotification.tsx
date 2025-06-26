import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import axios from "@/context/axios";
import { Link } from "react-router-dom";

interface Alert {
  id: number;
  timestamp: string;
  vm_ip: string;
  resource_type: string;
  level: string;
  message: string;
}

export default function AlertNotification() {
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get<Alert[]>("/api/alerts")
        .then(res => {
          const newCriticals = res.data.filter(a => a.level === "critical");
          if (newCriticals.length > 0 && newCriticals[0].id !== latestAlert?.id) {
            setLatestAlert(newCriticals[0]);
            setUnreadCount(newCriticals.length);
            setTimeout(() => setLatestAlert(null), 8000);
          }
          setAlerts(res.data.slice(0, 5));
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [latestAlert]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) setUnreadCount(0); // reset count when opened
  };

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell className="h-6 w-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 text-sm">
          <div className="p-3 font-semibold border-b">Recent Alerts</div>
          <ul className="max-h-64 overflow-y-auto">
            {alerts.length === 0 && (
              <li className="p-3 text-gray-500">No recent alerts</li>
            )}
            {alerts.map(alert => (
              <li key={alert.id} className={`px-4 py-2 hover:bg-slate-100 ${alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                <Link to="/alerts">
                  <strong>{alert.level.toUpperCase()}</strong>: {alert.message}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t p-2 text-right">
            <Link to="/alerts" className="text-blue-600 text-sm hover:underline">
              View all →
            </Link>
          </div>
        </div>
      )}

      {/* Toast */}
      {latestAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded shadow-lg animate-pulse">
          <p className="font-bold">⚠️ {latestAlert.resource_type.toUpperCase()} CRITICAL</p>
          <p>{latestAlert.message}</p>
          <p className="text-xs mt-1">{new Date(latestAlert.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}
