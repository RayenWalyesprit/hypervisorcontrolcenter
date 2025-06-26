// src/pages/AddUserForm.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/context/axios";
import { useAuth } from "@/context/AuthProvider";

interface ADUser {
  username: string;
  full_name: string;
  email: string | null;
}

export default function AddUserForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [adUsers, setAdUsers] = useState<ADUser[]>([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    role: "Viewer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      fetch("http://localhost:5000/me", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data?.user) setChecked(true);
          else navigate("/login");
        })
        .catch(() => navigate("/login"));
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    axios
      .get<ADUser[]>("/users")
      .then((res) => setAdUsers(res.data))
      .catch(() => setError("Failed to fetch AD users"));
  }, []);

  const handleSelectUser = (username: string) => {
    const user = adUsers.find((u) => u.username === username);
    if (user) {
      setForm({
        username: user.username,
        full_name: user.full_name,
        email: user.email || "",
        role: "Viewer",
      });
      setSelectedUsername(username);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelectUser(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/app-users/add", form);
      navigate("/admin/users");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return <div className="text-center mt-10 text-gray-500">Checking authentication...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add User from Active Directory</h2>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Select AD User</label>
          <select
            value={selectedUsername}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Select --</option>
            {adUsers.map((user) => (
              <option key={user.username} value={user.username}>
                {user.full_name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            value={form.full_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={form.email}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            value={form.role}
            onChange={handleRoleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Admin">Admin</option>
            <option value="Technician">Technician</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading || !selectedUsername}
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
}
