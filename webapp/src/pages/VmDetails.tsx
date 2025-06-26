// src/pages/VmDetails.tsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useParams } from "react-router-dom";

const TABS = ["CPU", "Memory", "Disk"];

export default function VmDetails() {
  const { vmIp } = useParams<{ vmIp: string }>();
  const [vmUsername, setVmUsername] = useState("");
  const [vmPassword, setVmPassword] = useState("");
  const [connected, setConnected] = useState(false);

  const [selectedTab, setSelectedTab] = useState("CPU");
  const [history, setHistory] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [vmInfo, setVmInfo] = useState<any>(null);
  const [vmInfox, setVmInfox] = useState<any>(null);
  const [error, setError] = useState("");
  const [sortColumn, setSortColumn] = useState("Name");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!connected || !vmIp) return;

    const creds = { username: vmUsername, password: vmPassword };

    const fetchAll = () => {
      // Agent metrics
      fetch(`http://localhost:5000/vm/${vmIp}/metrics`)
        .then((res) => res.text())
        .then((rawText) => {
  const sanitized = rawText.replace(/(\d),(\d)/g, "$1.$2");
  const data = JSON.parse(sanitized);

  setVmInfo(data);

  setHistory((prev) => [
    ...prev.slice(-19),
    {
      time: new Date().toLocaleTimeString(),
      CPU: parseFloat(data.cpu_usage_percent) || 0,
      Memory: parseFloat(data.memory_usage_percent) || 0,
      Disk: parseFloat(data.disk_active_percent) || 0,
    },
  ]);
})
        .catch((e) => setError("Agent fetch failed: " + e.message));
 fetch(`http://localhost:5000/vm/${vmIp}/systeminfo`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: vmUsername, password: vmPassword }),
  })
    .then((res) => res.json())
    .then((data) => setVmInfox(data))
    .catch((e) => setError("System info failed: " + e.message));
      // Services
      fetch(`http://localhost:5000/vm/${vmIp}/services`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.services)) {
            setServices(data.services);
            setFilteredServices(data.services);
          }
        })
        .catch((e) => setError("Service fetch failed: " + e.message));
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [connected, vmIp, vmUsername, vmPassword]);

  useEffect(() => {
    const filtered = services.filter((svc) =>
      svc.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.DisplayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  const sortServices = (column: string) => {
    const sorted = [...filteredServices].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setFilteredServices(sorted);
    setSortColumn(column);
    setSortAsc(!sortAsc);
  };

  const exportToCSV = () => {
    const csvHeader = "Name,DisplayName,Status,StartMode,ProcessId,CPU,MemoryMB,PathName\n";
    const csvRows = filteredServices.map((svc) =>
      [
        svc.Name,
        `"${svc.DisplayName}"`,
        svc.Status,
        svc.StartMode,
        svc.ProcessId,
        svc.CPU,
        svc.MemoryMB,
        `"${svc.PathName}"`,
      ].join(",")
    );
    const blob = new Blob([csvHeader + csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services_${vmIp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!connected) {
    return (
      <div className="max-w-sm mx-auto p-6 bg-white rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Connect to VM {vmIp}</h2>
        {error && <p className="text-red-500">{error}</p>}
        <label className="block text-sm">
          Username
          <input
            type="text"
            value={vmUsername}
            onChange={(e) => setVmUsername(e.target.value)}
            className="w-full mt-1 border rounded px-2 py-1"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={vmPassword}
            onChange={(e) => setVmPassword(e.target.value)}
            className="w-full mt-1 border rounded px-2 py-1"
          />
        </label>
        <button
          onClick={() => setConnected(true)}
          disabled={!vmUsername || !vmPassword}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* TOP SECTION: Charts + Info */}
      <div className="flex space-x-6">
        <div className="w-2/3 bg-white p-4 rounded shadow border">
          <div className="flex space-x-2 mb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={selectedTab}
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

   <div className="w-1/3 bg-white p-4 rounded shadow border space-y-2">
          <h3 className="text-xl font-semibold text-blue-700">VM Info</h3>
          {vmInfox ? (
            <div className="text-sm space-y-1 text-gray-700">
              <p><strong>Name:</strong> {vmInfox["Hypervisor Name"] || "—"}</p>
              <p><strong>OS:</strong> {vmInfox["OS"] || "—"}</p>
              <p><strong>CPU:</strong> {vmInfox["Processor Model"] || "—"}</p>
              <p><strong>RAM:</strong> {vmInfox["Installed RAM (GB)"]} GB</p>
              <p><strong>Disk:</strong> {vmInfox["Disk Total (GB)"]} GB</p>
              <p><strong>Uptime:</strong> {vmInfox["Uptime (hours)"]} hrs</p>
              <p><strong>IP:</strong> {vmInfox["IPv4 Address"] || "—"}</p>
            </div>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>
     
      </div>

      {/* SERVICES TABLE SECTION */}
      <div className="bg-white p-4 rounded shadow border max-h-[400px] overflow-auto">
        <div className="flex justify-between mb-3">
          <h3 className="text-lg font-semibold">Running Services</h3>
          <button
            onClick={exportToCSV}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search services..."
          className="mb-3 p-1 border rounded w-full"
        />

        <table className="min-w-full text-sm table-auto">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b text-left">
              {["Name", "DisplayName", "Status", "StartMode", "ProcessId", "CPU", "MemoryMB", "PathName"].map((col) => (
                <th
                  key={col}
                  onClick={() => sortServices(col)}
                  className="p-1 cursor-pointer hover:text-blue-700 whitespace-nowrap"
                >
                  {col} {sortColumn === col ? (sortAsc ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((svc, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1">{svc.Name}</td>
                <td className="p-1">{svc.DisplayName}</td>
                <td className="p-1">{svc.Status}</td>
                <td className="p-1">{svc.StartMode}</td>
                <td className="p-1">{svc.ProcessId}</td>
                <td className="p-1">{svc.CPU?.toFixed(2)}</td>
                <td className="p-1">{svc.MemoryMB?.toFixed(1)}</td>
                <td className="p-1 max-w-xs truncate" title={svc.PathName}>{svc.PathName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
