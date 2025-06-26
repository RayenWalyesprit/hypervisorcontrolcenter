// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import PerformanceCharts from "@/components/dashboard/PerformanceCharts";
import { Link } from "react-router-dom";

type Hypervisor = {
  id: number;
  name: string;
  ip_address: string;
};

export default function Dashboard() {
  const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
  const [selectedHypervisorId, setSelectedHypervisorId] = useState<number | null>(null);
  const [hypervisorInfo, setHypervisorInfo] = useState<any>(null);
  const [vms, setVMs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'vms' | 'performance' | 'events'>('vms');

  useEffect(() => {
    fetch('http://localhost:5000/api/hypervisors', { credentials: 'include' })
      .then(res => res.json())
      .then(setHypervisors)
      .catch(() => alert('Failed to fetch hypervisors'));
  }, []);

  useEffect(() => {
    if (selectedHypervisorId) {
      fetch(`http://localhost:5000/api/hypervisors/${selectedHypervisorId}/info`, { credentials: 'include' })
        .then(res => res.json())
        .then(setHypervisorInfo)
        .catch(() => alert('Failed to fetch hypervisor info'));

      fetch(`http://localhost:5000/api/hypervisors/${selectedHypervisorId}/vms`, { credentials: 'include' })
        .then(res => res.json())
        .then((data) => {
          if (Array.isArray(data)) setVMs(data);
          else if (data && typeof data === 'object') setVMs([data]);
          else setVMs([]);
        })
        .catch(() => alert('Failed to fetch VMs'));
    }
  }, [selectedHypervisorId]);

  const handleVmAction = async (vmName: string, action: 'start' | 'restart' | 'stop') => {
    const confirm = window.confirm(`Are you sure you want to ${action} VM "${vmName}"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/vm/${vmName}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await res.json();
      if (res.ok) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      alert(`❌ Error performing action: ${err}`);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Hypervisor Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Select Hypervisor:</label>
        <select
          onChange={(e) => setSelectedHypervisorId(Number(e.target.value))}
          value={selectedHypervisorId ?? ''}
          className="border rounded px-3 py-2"
        >
          <option value="">-- Select --</option>
          {hypervisors.map(hv => (
            <option key={hv.id} value={hv.id}>
              {hv.name} ({hv.ip_address})
            </option>
          ))}
        </select>
      </div>

      {/* Hypervisor Overview */}
      {hypervisorInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow">
          <div>
            <strong>Host Name:</strong> {hypervisorInfo["Hypervisor Name"]}
            <br />
            <small>{hypervisorInfo.OS}</small>
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date().toISOString().split('T')[0]}
          </div>
          <div>
            <strong>CPU:</strong> {hypervisorInfo["Logical Processors"]} Cores
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-full bg-blue-600 rounded w-[28%]"></div>
            </div>
          </div>
          <div>
            <strong>RAM:</strong> {hypervisorInfo["Installed RAM (GB)"]} GB
            <div className="h-2 bg-slate-200 rounded mt-1">
              <div className="h-full bg-blue-600 rounded w-[52%]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex gap-2 border-b mb-4">
          <button
            onClick={() => setActiveTab('vms')}
            className={`px-3 py-1 text-sm font-medium border-b-2 ${
              activeTab === 'vms' ? 'border-blue-600 text-blue-600' : 'text-gray-500 border-transparent'
            }`}
          >
            Virtual Machines
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1 text-sm font-medium border-b-2 ${
              activeTab === 'performance' ? 'border-blue-600 text-blue-600' : 'text-gray-500 border-transparent'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1 text-sm font-medium border-b-2 ${
              activeTab === 'events' ? 'border-blue-600 text-blue-600' : 'text-gray-500 border-transparent'
            }`}
          >
            Events
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'vms' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Virtual Machines</h2>
            {vms.length === 0 ? (
              <p className="text-gray-500">No VMs found.</p>
            ) : (
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm font-semibold text-gray-700 border-b">
                    <th className="p-2">Name</th>
                    <th>Status</th>
                    <th>CPU</th>
                    <th>Memory</th>
                    <th>Disk</th>
                    <th>Uptime</th>
                    <th>Replication</th>
                    <th>Backup</th>
                    <th>Actions</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {vms.map((vm, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{vm["Basic Info"]["VM Name"]}</td>
                      <td>{vm["Basic Info"]["State"]}</td>
                      <td>{vm["Performance"]["CPU"]["Usage"]}</td>
                      <td>{vm["Performance"]["Memory"]["Assigned (GB)"]} / {vm["Performance"]["Memory"]["Demand (GB)"]} GB</td>
                      <td>{vm["Storage"]["Total Size (GB)"]} GB</td>
                      <td>{vm["Uptime"]}</td>
                      <td>{vm["Replication"]["Status"]}</td>
                      <td>{vm["Backup"]["Last Backup"]}</td>
                      <td className="space-x-2">
                        <button className="text-blue-600 hover:underline" onClick={() => handleVmAction(vm["Basic Info"]["VM Name"], 'start')}>Start</button>
                        <button className="text-yellow-600 hover:underline" onClick={() => handleVmAction(vm["Basic Info"]["VM Name"], 'restart')}>Restart</button>
                        <button className="text-red-600 hover:underline" onClick={() => handleVmAction(vm["Basic Info"]["VM Name"], 'stop')}>Stop</button>
                      </td>
                      <td>
  <Link
    to={`/vm/${vm["Network"]["IP Addresses"].split(",")[0]}/details`}
    className="text-indigo-600 hover:underline"
  >
    Details
  </Link>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

{activeTab === 'performance' && selectedHypervisorId && (
  <div className="bg-white p-4 rounded shadow text-gray-600">
    <PerformanceCharts hypervisorId={selectedHypervisorId} />
  </div>
)}


        {activeTab === 'events' && (
          <div className="bg-white p-4 rounded shadow text-gray-600">
            <p>📝 Recent events, logs, or alerts will be displayed here (future).</p>
          </div>
        )}
      </div>
    </div>
  );
}
