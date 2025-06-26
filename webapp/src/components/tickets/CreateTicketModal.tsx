// src/components/tickets/CreateTicketModal.tsx
import React, { useState, useEffect } from 'react';

type Props = {
  isOpen: boolean;
  alertId: number | null;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CreateTicketModal({ isOpen, alertId, onClose, onSubmit }: Props) {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [description, setDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | "">("");


  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/app-users', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [isOpen]);

const handleSubmit = () => {
  fetch("http://localhost:5000/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      alert_id: alertId,
      assigned_user_id: selectedUser,
      description,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Ticket creation failed");
      return res.json();
    })
    .then(() => {
      onSubmit();
      onClose();
    })
    .catch((err) => {
      console.error("Ticket creation error:", err);
    });
};


  if (!isOpen || alertId === null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Create Ticket for Alert #{alertId}</h2>
        <label className="block">
          Assign to:
          <select
            className="w-full mt-1 p-2 border rounded"
            value={selectedUser}
            onChange={e => setSelectedUser(Number(e.target.value))}>
            <option value="">-- Select User --</option>
          {users.map(user => (
  <option key={user.id} value={user.id}>
    {user.username}
  </option>
))}
          </select>
        </label>
        <label className="block">
          Description:
          <textarea
            className="w-full mt-1 p-2 border rounded"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        </div>
      </div>
    </div>
  );
}
