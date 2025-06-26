// src/components/dashboard/PerformanceCharts.tsx
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

interface Props {
  hypervisorId: number;
}

export default function PerformanceCharts({ hypervisorId }: Props) {
  const [info, setInfo] = useState<any>(null);
  const [history, setHistory] = useState<{ time: string; cpu: number; memory: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://localhost:5000/api/hypervisors/${hypervisorId}/info`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setInfo(data);

          const cpu = data["CPU Usage (%)"] ?? 0;
          const memory = Math.min(
            Math.round((data["Used RAM (GB)"] / data["Installed RAM (GB)"]) * 100),
            100
          );

          setHistory((prev) => [
            ...prev.slice(-19),
            {
              time: new Date().toLocaleTimeString(),
              cpu,
              memory,
            },
          ]);
        })
        .catch(() => setError("❌ Failed to fetch performance info"));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [hypervisorId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!info) return <p>Loading performance data...</p>;

  const usedRam = info["Used RAM (GB)"];
  const totalRam = info["Installed RAM (GB)"];
  const usedDisk = info["Disk Total (GB)"] - info["Disk Free (GB)"];

  const formatPercentage = (used: number, total: number) =>
    total === 0 ? "0%" : `${Math.round((used / total) * 100)}%`;

  return (
    <div className="space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Performance Overview</h2>

      {/* Info Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
        {/* Memory */}
        <div>
          <h3 className="font-semibold mb-1">Memory</h3>
          <div className="w-full bg-gray-200 rounded h-4 mb-1">
            <div
              className="bg-purple-600 h-full rounded"
              style={{
                width: formatPercentage(usedRam, totalRam),
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>Used: {usedRam.toFixed(2)} GB</span>
            <span>Total: {totalRam} GB</span>
          </div>
        </div>

        {/* Disk */}
        <div>
          <h3 className="font-semibold mb-1">Disk</h3>
          <div className="w-full bg-gray-200 rounded h-4 mb-1">
            <div
              className="bg-blue-600 h-full rounded"
              style={{
                width: formatPercentage(usedDisk, info["Disk Total (GB)"]),
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>Used: {usedDisk.toFixed(2)} GB</span>
            <span>Total: {info["Disk Total (GB)"]} GB</span>
          </div>
        </div>

        {/* CPU */}
        <div>
          <h3 className="font-semibold mb-1">CPU</h3>
          <div className="flex justify-between mb-1">
            <span>{info["Processor Model"]}</span>
            <span>{info["Logical Processors"]} Cores</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-green-600 h-full rounded"
              style={{
                width: `${info["CPU Usage (%)"] ?? 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Uptime */}
        <div>
          <h3 className="font-semibold mb-1">Uptime</h3>
          <p>{info["Uptime (hours)"]} hours</p>
        </div>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white p-4 rounded border shadow">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">CPU Usage (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded border shadow">
          <h3 className="text-lg font-semibold mb-2 text-purple-600">Memory Usage (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="memory" stroke="#9333ea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
