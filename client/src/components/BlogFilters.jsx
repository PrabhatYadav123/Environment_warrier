import { Search } from "lucide-react";

export default function BlogFilters({ search, setSearch, category, setCategory, categories }) {
  return (
    <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-soft md:grid-cols-[1fr_220px]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 text-ink/40" size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field pl-10"
          placeholder="Search blogs"
        />
      </label>
      <select value={category} onChange={(event) => setCategory(event.target.value)} className="field">
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
