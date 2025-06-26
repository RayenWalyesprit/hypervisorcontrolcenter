import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, LogOut, Menu, Plus, ChevronDown, ChevronUp, Server, Sliders, Users,Boxes,CircleAlert } from 'lucide-react';
import { useSidebar } from './sidebar-context';
import api from '@/context/axios';

type Hypervisor = {
  id: number;
  name: string;
};

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/centraldashboard' },
  { label: 'Hypervisors', icon: Boxes, path: '/' },
  { label: 'Alerts', icon: CircleAlert, path: '/alerts' },
  { label: 'Settings', icon: Settings, path: '/parameters' },
  { label: 'Users', icon: Users, path: '/admin/users' }, 
];

export default function Sidebar() {
  const location = useLocation();
  const { expanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
  const [showHosts, setShowHosts] = useState(true);

  useEffect(() => {
    api.get<Hypervisor[]>('/api/hypervisors')
      .then(res => setHypervisors(res.data))
      .catch(err => console.error("Failed to fetch hypervisors", err));
  }, []);
  const logout = async () => {
    await api.post('/logout');
    navigate('/login');
  };

  const handleAddHost = () => {
    navigate('/parameters');
  };

  return (
    <aside className={`sticky top-0 z-40 h-screen border-r bg-white text-slate-800 transition-all duration-300 ${expanded ? 'w-64' : 'w-20'} flex flex-col shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Menu className="h-5 w-5 cursor-pointer" onClick={toggleSidebar} />
          {expanded && <span className="text-lg font-semibold">Hyper-V Monitor</span>}
        </div>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition ${
              location.pathname === path ? 'bg-blue-100 text-blue-700 font-semibold' : ''
            }`}
          >
            <Icon className="h-5 w-5" />
            {expanded && <span>{label}</span>}
          </Link>
        ))}

        <div className="mt-6 space-y-1">
          <div className="flex items-center justify-between px-3 text-sm font-medium text-slate-500">
            <button
              onClick={() => setShowHosts((prev) => !prev)}
              className="flex items-center gap-2 hover:text-slate-800"
            >
              {expanded && <span>Hyper-V Hosts</span>}
              {expanded && (showHosts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
              {!expanded && <Server className="w-5 h-5" />}
            </button>
            {expanded && (
              <button onClick={handleAddHost} className="hover:text-blue-600" title="Add Hyper-V Host">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {showHosts && hypervisors.map((host) => (
            <Link
              key={host.id}
              to="/"
              className={`ml-4 mt-1 flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-blue-50 ${
                location.pathname === '/' ? 'bg-blue-100 text-blue-700 font-semibold' : ''
              }`}
            >
              <Server className="w-4 h-4" />
              {expanded && <span>{host.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button onClick={logout} 
         className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <LogOut className="h-4 w-4" />
          {expanded && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
