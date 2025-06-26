// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthProvider';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [adConfig, setAdConfig] = useState({
    server: '',
    base_dn: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/ad-config", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data) setAdConfig(data);
      })
      .catch(err => console.error("AD config fetch error", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Update AD config in backend
      const updateRes = await fetch('http://localhost:5000/api/ad-config', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adConfig),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.error || 'Failed to update AD config');
      }

      // Step 2: Proceed with login
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? <Spinner /> : 'Connect'}
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 text-sm underline"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-2 text-sm">
            <label>AD Server
              <input
                className="w-full border p-1 rounded"
                value={adConfig.server}
                onChange={e => setAdConfig({ ...adConfig, server: e.target.value })}
              />
            </label>
            <label>Base DN
              <input
                className="w-full border p-1 rounded"
                value={adConfig.base_dn}
                onChange={e => setAdConfig({ ...adConfig, base_dn: e.target.value })}
              />
            </label>
            <label>Username
              <input
                className="w-full border p-1 rounded"
                value={adConfig.username}
                onChange={e => setAdConfig({ ...adConfig, username: e.target.value })}
              />
            </label>
            <label>Password
              <input
                className="w-full border p-1 rounded"
                type="password"
                value={adConfig.password}
                onChange={e => setAdConfig({ ...adConfig, password: e.target.value })}
              />
            </label>
          </div>
        )}
      </form>
    </div>
  );
}
