import { Eye, FileText, Heart, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/blogs/analytics/summary").then(({ data }) => setStats(data));
  }, []);

  const cards = [
    ["Total Blogs", stats?.totalBlogs ?? 0, FileText],
    ["Published", stats?.publishedBlogs ?? 0, Eye],
    ["Drafts", stats?.draftBlogs ?? 0, PencilLine],
    ["Likes", stats?.totalLikes ?? 0, Heart]
  ];

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Dashboard</p>
        <h1 className="text-3xl font-black">CMS Overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <Icon className="text-forest" size={24} />
            <p className="mt-4 text-3xl font-black">{value}</p>
            <p className="text-sm font-semibold text-ink/60">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="font-black">Total Views</h2>
        <p className="mt-2 text-4xl font-black text-forest">{stats?.totalViews ?? 0}</p>
      </div>
    </section>
  );
}
