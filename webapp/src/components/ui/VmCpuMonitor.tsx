// src/components/ui/VmCpuMonitor.tsx
import React, { useEffect, useState } from "react";

type Props = {
  vmIp: string;
};

type CpuProcess = {
  Name: string;
  CPU: number;
};

export default function VmCpuMonitor({ vmIp }: Props) {
  const [cpuData, setCpuData] = useState<CpuProcess[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/vm/${vmIp}/cpu`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('CPU API response:', data);

        if (Array.isArray(data.cpu)) {
          setCpuData(data.cpu);
        } else {
          setError(typeof data?.error === 'string' ? data.error : 'Unexpected CPU data format');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching CPU data:", err);
        setError("Error fetching CPU data");
        setLoading(false);
      });
  }, [vmIp]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-3">🧠 CPU Usage</h2>

      {loading && <p className="text-gray-500">Loading CPU usage...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {cpuData.length > 0 ? (
        <div className="space-y-2 text-sm">
          {cpuData.map((proc, i) => (
            <div key={i} className="flex justify-between">
              <span>{proc.Name}</span>
              <span>{proc.CPU.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="text-gray-500">No CPU data available.</p>
      )}
    </div>
  );
}
