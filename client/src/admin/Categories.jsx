import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });

  async function load() {
    const { data } = await api.get("/categories");
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api.post("/categories", form);
    setForm({ name: "", description: "" });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete category?")) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Categories</p>
        <h1 className="text-3xl font-black">Manage Categories</h1>
      </div>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Description</span>
          <input className="field" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <button className="btn-primary">
          <Plus size={18} /> Add
        </button>
      </form>
      <div className="grid gap-3">
        {categories.map((category) => (
          <div key={category._id} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-soft">
            <div>
              <h2 className="font-black">{category.name}</h2>
              <p className="text-sm text-ink/60">{category.description}</p>
            </div>
            <button className="btn-secondary px-3 text-red-700" onClick={() => remove(category._id)} aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
