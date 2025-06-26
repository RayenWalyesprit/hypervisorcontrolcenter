import React, { useEffect, useState } from 'react';
import SidebarForm from '@/components/parameters/SidebarForm';
import ADConfigForm from '@/components/parameters/ADConfigForm';
import HypervisorForm from '@/components/parameters/HypervisorForm';
import SQLConfigForm from '@/components/parameters/SQLConfigForm'; // ✅ Make sure this exists
import { Database, Plus, Settings } from 'lucide-react';

type Hypervisor = {
  id: number;
  name: string;
  ip_address: string;
  hypervisor_type: string;
  last_updated: string;
};

export default function Parameter() {
  const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
  const [sidebar, setSidebar] = useState<'' | 'ad' | 'hv' | 'sql'>('');

  const loadData = () => {
    fetch('http://localhost:5000/api/parameters', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setHypervisors(data.hypervisors || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Admin Control Panel</h1>
      <p className="text-gray-500 mb-4">Manage your virtual infrastructure</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSidebar('ad')}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
        >
          <Settings className="w-4 h-4" />
          Edit AD Config
        </button>

        <button
          onClick={() => setSidebar('hv')}
          className="bg-white border px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" />
          Add Hypervisor
        </button>

        <button
          onClick={() => setSidebar('sql')}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
        >
          <Database className="w-4 h-4" />
          Edit DB Config
        </button>
      </div>

      <div className="bg-white shadow rounded border overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-sm text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">IP Address</th>
              <th className="px-4 py-2">Hypervisor</th>
            </tr>
          </thead>
          <tbody>
            {hypervisors.map((hv) => (
              <tr key={hv.id} className="border-t hover:bg-gray-50 text-sm">
                <td className="px-4 py-2 flex items-center gap-2">
                  <span role="img" aria-label="server">🖥️</span>
                  {hv.name}
                </td>
                <td className="px-4 py-2">{hv.ip_address}</td>
                <td className="px-4 py-2">{hv.hypervisor_type || 'Hyper-V'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidebarForm
        open={!!sidebar}
        onClose={() => setSidebar('')}
        title={
          sidebar === 'sql'
            ? 'Edit SQL Server Config'
            : sidebar === 'ad'
            ? 'Edit AD Config'
            : 'Add Hypervisor'
        }
      >
        {sidebar === 'sql' ? (
          <SQLConfigForm onSaved={() => { loadData(); setSidebar(''); }} />
        ) : sidebar === 'ad' ? (
          <ADConfigForm onSaved={() => { loadData(); setSidebar(''); }} />
        ) : (
          <HypervisorForm onSaved={() => { loadData(); setSidebar(''); }} />
        )}
      </SidebarForm>
    </div>
  );
}
