// src/components/parameters/ADConfigForm.tsx
import React, { useState, useEffect } from 'react';

type Props = {
  onSaved: () => void;
};

export default function ADConfigForm({ onSaved }: Props) {
  const [adConfig, setAdConfig] = useState({ server: '', base_dn: '', username: '', password: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/ad-config', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAdConfig(data || {}))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/ad-config', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adConfig),
    });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="input w-full" placeholder="Server" value={adConfig.server} onChange={e => setAdConfig({ ...adConfig, server: e.target.value })} />
      <input className="input w-full" placeholder="Base DN" value={adConfig.base_dn} onChange={e => setAdConfig({ ...adConfig, base_dn: e.target.value })} />
      <input className="input w-full" placeholder="Username" value={adConfig.username} onChange={e => setAdConfig({ ...adConfig, username: e.target.value })} />
      <input className="input w-full" placeholder="Password" type="password" value={adConfig.password} onChange={e => setAdConfig({ ...adConfig, password: e.target.value })} />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update AD</button>
    </form>
  );
}
