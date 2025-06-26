import { useEffect, useMemo, useState } from "react";
import axios from "@/context/axios";
import AlertsSummary from "@/components/dashboard/AlertsSummary";
import CreateTicketModal from '@/components/tickets/CreateTicketModal';

interface Alert {
  id: number;
  timestamp: string;
  hypervisor_id: number;
  vm_ip: string;
  resource_type: string;
  level: string;
  value: number;
  message: string;
}

type ResourceType = 'cpu' | 'memory' | 'disk';

type Thresholds = {
  [key in ResourceType]: {
    warning: number;
    critical: number;
  };
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thresholds, setThresholds] = useState<Thresholds>({
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 75, critical: 90 },
    disk: { warning: 80, critical: 95 },
  });

  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    axios.get<Alert[]>("/api/alerts")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error("Failed to fetch alerts:", err));

    axios.get<Thresholds>("/api/alert-thresholds")
      .then((res) => setThresholds(res.data))
      .catch((err) => console.error("Failed to load thresholds:", err));
  }, []);

  const handleThresholdChange = (
    resource: ResourceType,
    type: 'warning' | 'critical',
    value: number
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [type]: value,
      },
    }));
  };

  const saveThresholds = () => {
    axios.post("/api/alert-thresholds", thresholds)
      .then(() => setSidebarOpen(false))
      .catch(err => console.error("Failed to save thresholds:", err));
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesLevel = levelFilter ? alert.level === levelFilter : true;
      const matchesResource = resourceFilter ? alert.resource_type === resourceFilter : true;
      return matchesLevel && matchesResource;
    });
  }, [alerts, levelFilter, resourceFilter]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">System Alerts</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setSidebarOpen(true)}
        >
          Configure Thresholds
        </button>
      </div>

      <AlertsSummary />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4"> Alerts</h2>
              {selectedAlertId !== null && (
        <div className="flex justify-end mb-2">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setTicketModalOpen(true)}
          >
            Create Ticket
          </button>
        </div>
      )}

      <CreateTicketModal
        isOpen={ticketModalOpen}
        alertId={selectedAlertId}
        onClose={() => setTicketModalOpen(false)}
        onSubmit={() => { setAlerts(prev => prev.filter(a => a.id !== selectedAlertId));  // ⬅️ Remove alert from UI
    setSelectedAlertId(null);
        }}
      />
        <div className="overflow-x-auto bg-white rounded shadow">
         <table className="min-w-full table-auto">
  <thead className="bg-gray-50 border-b text-sm text-gray-600">
    <tr>
      <th className="px-2 py-2 w-8"></th>
      <th className="px-4 py-2 text-left">Timestamp</th>
      <th className="px-4 py-2 text-left">VM IP</th>
      <th
        className="px-4 py-2 text-left cursor-pointer hover:text-blue-700"
        onClick={() =>
          setResourceFilter((prev) =>
            prev === null ? "cpu" : prev === "cpu" ? "memory" : prev === "memory" ? "disk" : null
          )
        }
      >
        Resource
        {resourceFilter && (
          <span className="ml-2 text-blue-600 font-semibold">
            ({resourceFilter.toUpperCase()})
          </span>
        )}
      </th>
      <th
        className="px-4 py-2 text-left cursor-pointer hover:text-blue-700"
        onClick={() =>
          setLevelFilter((prev) =>
            prev === null ? "critical" : prev === "critical" ? "warning" : null
          )
        }
      >
        Level
        {levelFilter && (
          <span className="ml-2 font-semibold text-red-600 uppercase">
            ({levelFilter})
          </span>
        )}
      </th>
      <th className="px-4 py-2 text-left">Value (%)</th>
      <th className="px-4 py-2 text-left">Message</th>
    </tr>
  </thead>

  <tbody>
    {filteredAlerts.length === 0 ? (
      <tr>
        <td colSpan={7} className="text-center text-sm py-6 text-gray-500">
          No alerts match the selected filters.
        </td>
      </tr>
    ) : (
      filteredAlerts.map((alert) => (
        <tr
          key={alert.id}
          className={`border-t hover:bg-gray-50 cursor-pointer ${
            selectedAlertId === alert.id ? "bg-indigo-50" : ""
          }`}
          onClick={() => setSelectedAlertId(alert.id)}
        >
          <td className="px-2 py-2">
            <input
              type="radio"
              name="selectedAlert"
              checked={selectedAlertId === alert.id}
              onClick={(e) => e.stopPropagation()}
              onChange={() => setSelectedAlertId(alert.id)}
              className="accent-indigo-600"
            />
          </td>
          <td className="px-4 py-2">{new Date(alert.timestamp).toLocaleString()}</td>
          <td className="px-4 py-2">{alert.vm_ip}</td>
          <td className="px-4 py-2">
            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {alert.resource_type.toUpperCase()}
            </span>
          </td>
          <td className="px-4 py-2">
            {alert.level === "critical" ? (
              <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                CRITICAL
              </span>
            ) : (
              <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                WARNING
              </span>
            )}
          </td>
          <td className="px-4 py-2">{alert.value.toFixed(1)}</td>
          <td className="px-4 py-2 text-gray-700">{alert.message}</td>
        </tr>
      ))
    )}
  </tbody>
</table>

        </div>

        {(levelFilter || resourceFilter) && (
          <div className="mt-2 text-right">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                setLevelFilter(null);
                setResourceFilter(null);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Threshold Config Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l p-6 z-50 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Alert Thresholds</h2>
          {["cpu", "memory", "disk"].map(resource => (
            <div key={resource} className="mb-6">
              <h3 className="text-md font-bold capitalize">{resource}</h3>
              <div className="space-y-2 mt-2">
                <label className="block text-sm">
                  Warning Threshold
                  <input
                    type="number"
                    value={thresholds[resource as ResourceType].warning}
                    onChange={e => handleThresholdChange(resource as ResourceType, "warning", +e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </label>
                <label className="block text-sm">
                  Critical Threshold
                  <input
                    type="number"
                    value={thresholds[resource as ResourceType].critical}
                    onChange={e => handleThresholdChange(resource as ResourceType, "critical", +e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </label>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <button className="text-gray-600 underline" onClick={() => setSidebarOpen(false)}>
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={saveThresholds}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
