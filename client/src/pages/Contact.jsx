import { Send } from "lucide-react";
import { useState } from "react";
import api from "../services/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus("Sending...");
    await api.post("/contact", form);
    setForm({ name: "", email: "", message: "" });
    setStatus("Message sent. Thank you.");
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Contact</p>
        <h1 className="mt-2 text-4xl font-black">Work with the group</h1>
        <p className="mt-4 leading-7 text-ink/70">Send event ideas, volunteer notes, partnership requests or local environmental concerns.</p>
      </div>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft">
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Message</span>
          <textarea className="field min-h-36" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
        </label>
        <button className="btn-primary">
          <Send size={18} /> Send
        </button>
        {status && <p className="text-sm font-semibold text-forest">{status}</p>}
      </form>
    </section>
  );
}
