import React, { useEffect, useState } from "react";

type AdapterStat = {
  Adapter: string;
  IPv4: string;
  Sent_Kbps: number;
  Received_Kbps: number;
};

export default function PerformanceMonitor({
  vmIp,
  username,
  password
}: {
  vmIp: string;
  username: string;
  password: string;
}) {
  const [data, setData] = useState<AdapterStat[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch(`http://localhost:5000/vm/${vmIp}/network-usage`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((json) => {
          setData(json.adapters || []);
        })
        .catch(console.error);
    };

    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, [vmIp, username, password]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-semibold mb-2">Network Interfaces</h3>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {data.map((a) => (
          <button
            key={a.Adapter}
            onClick={() => setSelected(a.Adapter)}
            className={`px-2 py-1 rounded border ${
              selected === a.Adapter ? "bg-blue-600 text-white" : ""
            }`}
          >
            {a.Adapter}
          </button>
        ))}
      </div>

      {selected && (
        <div className="text-sm text-gray-700">
          {data
            .filter((a) => a.Adapter === selected)
            .map((a) => (
              <div key={a.Adapter}>
                <p><strong>IPv4:</strong> {a.IPv4}</p>
                <p><strong>Sent:</strong> {a.Sent_Kbps} Kbps</p>
                <p><strong>Received:</strong> {a.Received_Kbps} Kbps</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
