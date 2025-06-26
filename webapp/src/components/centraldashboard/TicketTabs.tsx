// TicketTabs.tsx
import { useEffect, useState } from "react";
import axios from "@/context/axios";

interface Ticket {
  id: number;
  alert_id: number;
  assigned_user: string;
  status: string;
  created_at: string;
}

interface AvailabilityEntry {
  vm_ip: string;
  availability: number;
  downtime_seconds: number;
  observation_window_seconds: number;
}

export default function TicketTabs({ availabilityData }: { availabilityData: AvailabilityEntry[] }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    axios.get("/api/tickets").then((res) => setTickets(res.data as Ticket[]));
  }, []);

  const completed = tickets.filter((t) => t.status === "completed");
  const open = tickets.filter((t) => t.status !== "completed");

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b mb-4">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3 py-1 text-sm font-medium border-b-2 ${
            activeTab === 'tickets' ? 'border-blue-600 text-blue-600' : 'text-gray-500 border-transparent'
          }`}
        >
          Ticket Status
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-3 py-1 text-sm font-medium border-b-2 ${
            activeTab === 'availability' ? 'border-blue-600 text-blue-600' : 'text-gray-500 border-transparent'
          }`}
        >
          Availability Table
        </button>
      </div>

      {activeTab === 'tickets' && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2 text-gray-700">Completed Tickets</h3>
          <ul className="text-sm text-green-600 mb-4">
            {completed.map((t) => (
              <li key={t.id}>#{t.id} – {t.assigned_user} – {t.created_at}</li>
            ))}
          </ul>
          <h3 className="text-md font-semibold mb-2 text-gray-700">Open Tickets</h3>
          <ul className="text-sm text-red-600">
            {open.map((t) => (
              <li key={t.id}>#{t.id} – {t.assigned_user} – {t.created_at}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2 text-gray-700">VM / Hypervisor Availability</h3>
          <table className="w-full text-sm text-left text-gray-700 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">VM IP</th>
                <th className="px-3 py-2 border">Availability (%)</th>
                <th className="px-3 py-2 border">Downtime (s)</th>
              </tr>
            </thead>
            <tbody>
              {availabilityData.map((entry) => (
                <tr key={entry.vm_ip} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-1 border">{entry.vm_ip}</td>
                  <td className="px-3 py-1 border">{entry.availability.toFixed(2)}</td>
                  <td className="px-3 py-1 border">{entry.downtime_seconds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
