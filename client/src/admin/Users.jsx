import { Plus, Save, Trash2, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { name: "", email: "", password: "", role: "author" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/auth/users");
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(user) {
    setEditing(user._id || user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;

      if (editing) {
        await api.put(`/auth/users/${editing}`, payload);
        setMessage("User updated.");
      } else {
        await api.post("/auth/users", payload);
        setMessage("User created.");
      }

      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save user");
    }
  }

  async function remove(user) {
    if (!confirm(`Delete ${user.name}?`)) return;
    setMessage("");
    setError("");

    try {
      await api.delete(`/auth/users/${user._id || user.id}`);
      setMessage("User deleted.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user");
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Access</p>
        <h1 className="text-3xl font-black">Manage Users</h1>
      </div>

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_1fr_1fr_160px_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label className="grid gap-2">
          <span className="label">{editing ? "New Password" : "Password"}</span>
          <input className="field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editing} minLength={8} />
        </label>
        <label className="grid gap-2">
          <span className="label">Role</span>
          <select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="author">Author</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button className="btn-primary">
            {editing ? <Save size={18} /> : <Plus size={18} />}
            {editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && <p className="rounded-md bg-green-50 p-3 text-sm font-semibold text-forest">{message}</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-3">
        {users.map((user) => (
          <div key={user._id || user.id} className="flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-leaf/15 text-forest">
                <UsersIcon size={18} />
              </span>
              <div>
                <h2 className="font-black">{user.name}</h2>
                <p className="text-sm text-ink/60">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-mist px-3 py-2 text-xs font-black uppercase text-ink/70">{user.role}</span>
              <button type="button" onClick={() => startEdit(user)} className="btn-secondary">
                Edit
              </button>
              <button type="button" onClick={() => remove(user)} className="btn-secondary px-3 text-red-700" aria-label="Delete user">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
