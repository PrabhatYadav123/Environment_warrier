import { Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";

export default function Profile() {
  const { user, setUser, setToken } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    const { data } = await api.put("/auth/me", payload);
    localStorage.setItem("ew_token", data.token);
    localStorage.setItem("ew_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setMessage("Profile updated.");
  }

  return (
    <section className="grid max-w-2xl gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Profile</p>
        <h1 className="text-3xl font-black">Admin Profile</h1>
      </div>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="grid gap-2">
          <span className="label">New Password</span>
          <input className="field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <button className="btn-primary w-fit">
          <Save size={18} /> Save
        </button>
        {message && <p className="text-sm font-semibold text-forest">{message}</p>}
      </form>
    </section>
  );
}
