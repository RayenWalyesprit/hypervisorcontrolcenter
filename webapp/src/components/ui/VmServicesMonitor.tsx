// src/components/ui/VmServicesMonitor.tsx
import React, { useEffect, useState } from "react";

type Props = {
  vmIp: string;
};

type Service = {
  Name: string;
  State?: string;
};

export default function VmServicesMonitor({ vmIp }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/vm/${vmIp}/services`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setError(typeof data?.error === 'string' ? data.error : 'Unexpected response format');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError("Error fetching services");
        setLoading(false);
      });
  }, [vmIp]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-3">🛠 Running Services</h2>
      {loading && <p className="text-gray-500">Loading services...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {services.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {services.map((svc, i) => (
            <div key={i} className="border rounded p-2 bg-slate-50 text-slate-800">
              {svc.Name}
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="text-gray-500">No services found.</p>
      )}
    </div>
  );
}
