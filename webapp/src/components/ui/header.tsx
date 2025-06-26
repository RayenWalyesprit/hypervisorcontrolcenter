import { useEffect, useState } from 'react';
import { Bell, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/context/axios';

interface Alert {
  id: number;
  level: string;
  message: string;
  timestamp: string;
}

export default function Header() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lastAlertId, setLastAlertId] = useState<number | null>(null);
  const [lastSeenId, setLastSeenId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get<Alert[]>('/api/alerts');
        const recent = res.data.slice(0, 5);
        const latest = recent[0];

        setAlerts(recent);

        if (latest && latest.id !== lastAlertId && latest.level === 'critical') {
          triggerPulse();
          showToast(latest);
          setLastAlertId(latest.id);
        }

        const newCount = lastSeenId
          ? recent.filter(a => a.id > lastSeenId).length
          : recent.length;

        setUnreadCount(newCount);
      } catch (err) {
        console.error('Alert fetch error', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [lastAlertId, lastSeenId]);

  const triggerPulse = () => {
    const bell = document.getElementById('alert-bell');
    if (bell) {
      bell.classList.add('animate-shake');
      setTimeout(() => bell.classList.remove('animate-shake'), 800);
    }
  };

  const showToast = (alert: Alert) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-3 py-2 rounded shadow z-50 text-sm';
    toast.innerHTML = `<strong>⚠️ ${alert.level.toUpperCase()}</strong><div>${alert.message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 5000);
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => {
      const willOpen = !prev;
      if (willOpen && alerts.length > 0) {
        setLastSeenId(alerts[0].id);
        setUnreadCount(0);
      }
      return willOpen;
    });
  };

  const logout = async () => {
    await api.post('/logout');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">Hypervisor Control Center</h1>
      <div className="flex items-center gap-6 relative">
        {/* Alerts */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="relative"
          >
            <Bell
              id="alert-bell"
              className={`h-6 w-6 text-slate-600 transition-transform ${unreadCount > 0 ? 'text-red-600' : ''}`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50 text-sm">
              <div className="p-3 font-semibold border-b flex items-center gap-1">
                <span className="rotate-45 text-red-500">▲</span>
                Recent Alerts
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {alerts.length === 0 && (
                  <li className="p-3 text-gray-500">No recent alerts</li>
                )}
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={`px-4 py-2 hover:bg-slate-100 cursor-pointer ${
                      alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    <Link to="/alerts">
                      <strong>{alert.level.toUpperCase()}</strong>: {alert.message}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t px-3 py-2 text-right">
                <Link to="/alerts" className="text-blue-600 text-sm hover:underline">
                  View all →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
<div className="relative">
  <button onClick={() => setUserMenuOpen(!userMenuOpen)}>
    <UserCircle className="h-6 w-6 text-slate-600" />
  </button>
  {userMenuOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow text-sm z-50">
<button
  onClick={() => {
    setUserMenuOpen(false);
    navigate("/tickets");
  }}
  className="w-full text-left px-4 py-2 hover:bg-slate-100"
>
  My Tickets
</button>
<button
  onClick={() => {
    setUserMenuOpen(false);
    navigate("/admin/add-user");
  }}
  className="w-full text-left px-4 py-2 hover:bg-slate-100 border-t"
>
  Add User
</button>
      <button
        onClick={logout}
        className="w-full text-left px-4 py-2 hover:bg-slate-100 border-t"
      >
        Logout
      </button>
    </div>
  )}
</div>

      </div>
    </header>
  );
}
