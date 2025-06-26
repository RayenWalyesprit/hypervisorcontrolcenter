import { useState } from "react";

export default function AddHypervisorModal({ onAdd }: { onAdd: (host: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ip: "",
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(form);
    setForm({ name: "", ip: "", username: "", password: "" });
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-blue-600 hover:underline text-xs ml-auto">
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Hyper-V Host</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Host Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                required
                placeholder="IP Address"
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                required
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
