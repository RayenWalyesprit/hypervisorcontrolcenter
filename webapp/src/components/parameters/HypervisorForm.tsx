// src/components/parameters/HypervisorForm.tsx
import React, { useState } from 'react';

type Props = {
  onSaved: () => void;
};

export default function HypervisorForm({ onSaved }: Props) {
  const [form, setForm] = useState({ name: '', ip_address: '', username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/addhypervisors', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', ip_address: '', username: '', password: '' });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="input w-full" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="input w-full" placeholder="IP Address" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} />
      <input className="input w-full" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
      <input className="input w-full" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Hypervisor</button>
    </form>
  );
}
