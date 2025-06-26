import { useEffect, useState } from "react";
import axios from "@/context/axios";

interface AppUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "Admin" | "Technician" | "Viewer";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

const loadUsers = async () => {
  try {
    const res = await axios.get<AppUser[]>("/api/app-users");
    setUsers(res.data);
  } catch (err) {
    console.error("Failed to load users", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadUsers();
}, []);


  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/app-users/${id}/delete`);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (id: number, newRole: AppUser["role"]) => {
    try {
      await axios.post(`/api/app-users/${id}/update-role`, { role: newRole });
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Role update failed:", err);
      alert("Failed to update role.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Application Users</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.full_name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={e =>
                      handleRoleChange(user.id, e.target.value as AppUser["role"])
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Technician">Technician</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
