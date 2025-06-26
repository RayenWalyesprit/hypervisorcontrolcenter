// src/pages/Tickets.tsx
import { useEffect, useState } from 'react';
import api from '@/context/axios';
import { CheckCircle } from 'lucide-react';

interface Ticket {
  id: number;
  alert_id: number;
  assigned_to: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    api.get<Ticket[]>('/api/tickets')
      .then((res) => setTickets(res.data))
      .catch((err) => console.error("Failed to fetch tickets", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

      <div className="bg-white rounded shadow border overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">Alert #{t.alert_id}</div>
                  <div className="text-gray-500 text-xs">{t.description}</div>
                </td>
<td className="p-2">
  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
    t.status === 'completed'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-600'
  }`}>
    {t.status}
  </span>
</td>
                <td className="p-4">{t.assigned_to}</td>
                <td className="p-4">{new Date(t.created_at).toLocaleDateString()}</td>
<td className="p-2 text-right">
  <button
    className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
    onClick={() => {
      api.post(`/api/tickets/${t.id}/complete`)
        .then(() => setTickets(tickets.map(ticket =>
          ticket.id === t.id ? { ...ticket, status: 'completed' } : ticket
        )))
        .catch(err => console.error("Failed to complete ticket", err));
    }}
  >
    <CheckCircle className="w-4 h-4" />
    Complete
  </button>
</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-6">No tickets assigned to you.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
