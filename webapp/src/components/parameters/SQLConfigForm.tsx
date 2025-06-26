import React, { useEffect, useState } from 'react';

type Props = {
  onSaved: () => void;
};

export default function SQLConfigForm({ onSaved }: Props) {
  const [form, setForm] = useState({
    server: '',
    database: '',
    username: '',
    password: '',
  });

  // Fetch existing config on load
  useEffect(() => {
    fetch('http://localhost:5000/api/sql-config', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            server: data.server || '',
            database: data.database || '',
            username: data.username || '',
            password: data.password || '',
          });
        }
      })
      .catch((err) => console.error('Failed to load SQL config:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/sql-config', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="input w-full"
        placeholder="Server"
        value={form.server}
        onChange={(e) => setForm({ ...form, server: e.target.value })}
      />
      <input
        className="input w-full"
        placeholder="Database"
        value={form.database}
        onChange={(e) => setForm({ ...form, database: e.target.value })}
      />
      <input
        className="input w-full"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        className="input w-full"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Configuration
      </button>
    </form>
  );
}
