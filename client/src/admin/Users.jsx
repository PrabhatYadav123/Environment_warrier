import { Plus, Save, Trash2, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { name: "", email: "", password: "", role: "author" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    try {
      setLoading(true);

      const { data } = await api.get("/auth/users");

      setUsers(data.users);
      setCurrentUser(data.currentUser);
    } finally {
      setLoading(false);
    }
  }

  function canEdit(user) {
    if (!currentUser) return false;

    if (currentUser.role === "super_admin") {
      return user.role !== "super_admin";
    }

    if (currentUser.role === "admin") {
      return user.role === "author";
    }

    return false;
  }

  function canDelete(user) {
    if (!currentUser) return false;

    if (String(user._id) === String(currentUser._id)) {
      return false;
    }

    if (currentUser.role === "super_admin") {
      return user.role !== "super_admin";
    }

    if (currentUser.role === "admin") {
      return user.role === "author";
    }

    return false;
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(user) {
    setEditing(user._id || user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = { ...form };

      if (editing && !payload.password) {
        delete payload.password;
      }

      if (editing) {
        await api.put(`/auth/users/${editing}`, payload);
        setMessage("User updated successfully.");
      } else {
        await api.post("/auth/users", payload);
        setMessage("User created successfully.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

 async function remove(user) {
  if (!window.confirm(`Delete ${user.name}?`)) return;

  setDeletingId(user._id);
  setError("");
  setMessage("");

  try {
    await api.delete(`/auth/users/${user._id}`);
    setMessage("User deleted successfully.");
    await load();
  } catch (err) {
    setError(err.response?.data?.message || "Unable to delete user");
  } finally {
    setDeletingId(null);
  }
}

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <section className="grid gap-4">
        <div className="rounded-md bg-white p-6 shadow-soft">
          Loading users...
        </div>
      </section>
    );
  }

  const roleClass = {
    super_admin: "bg-red-100 text-red-700",
    admin: "bg-blue-100 text-blue-700",
    author: "bg-green-100 text-green-700",
  };

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">
          Access
        </p>
        <h1 className="text-3xl font-black">Manage Users</h1>
      </div>

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_1fr_1fr_160px_auto] lg:items-end"
      >
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input
            className="field"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input
            className="field"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">{editing ? "New Password" : "Password"}</span>
          <input
            className="field"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required={!editing}
            minLength={8}
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Role</span>
          <select
            className="field"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="author">Author</option>

            {currentUser?.role === "super_admin" && (
              <>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </>
            )}
          </select>
        </label>
        <div className="flex gap-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save" : "Add User"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && (
        <p className="rounded-md bg-green-50 p-3 text-sm font-semibold text-forest">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

<input
    className="field"
    placeholder="Search by name or email..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
/>
      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <div
            key={user._id || user.id}
            className="flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-leaf/15 text-forest">
                <UsersIcon size={18} />
              </span>
              <div>
                <div>
  <h2 className="font-black flex items-center gap-2">
    {user.name}

    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
        roleClass[user.role]
      }`}
    >
      {user.role.replace("_", " ")}
    </span>

    {currentUser?._id === user._id && (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
        You
      </span>
    )}
  </h2>

  <p className="text-sm text-ink/60">{user.email}</p>
</div>
              </div>
            </div>
            {canEdit(user) && (
              <button
                type="button"
                onClick={() => startEdit(user)}
                className="btn-secondary"
              >
                Edit
              </button>
            )}

            {canDelete(user) && (
              <button
                type="button"
                onClick={() => remove(user)}
                className="btn-secondary px-3 text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
