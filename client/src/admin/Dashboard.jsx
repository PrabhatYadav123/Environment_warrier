import { Eye, FileText, Heart, Mail, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blogs/analytics/summary")
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Blogs",
      value: stats?.totalBlogs ?? 0,
      icon: FileText,
      href: "/admin/blogs",
      color: "bg-blue-50 text-blue-600"
    },
    {
      label: "Published",
      value: stats?.publishedBlogs ?? 0,
      icon: Eye,
      href: "/admin/blogs?status=published",
      color: "bg-green-50 text-green-600"
    },
    {
      label: "Drafts",
      value: stats?.draftBlogs ?? 0,
      icon: PencilLine,
      href: "/admin/blogs?status=draft",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      label: "Total Likes",
      value: stats?.totalLikes ?? 0,
      icon: Heart,
      href: "/admin/blogs",
      color: "bg-red-50 text-red-600"
    },
    {
      label: "Contact Messages",
      value: stats?.totalContacts ?? 0,
      icon: Mail,
      href: "/admin/contacts",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  if (loading) return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">Dashboard</p>
        <h1 className="text-3xl font-black">CMS Overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-md border border-ink/10 bg-white p-5 shadow-soft animate-pulse">
            <div className="h-6 w-6 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <section className="grid gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-forest">Dashboard</p>
          <h1 className="text-3xl font-black">CMS Overview</h1>
        </div>
        <Link to="/admin/blogs/new" className="btn-primary">
          + New Blog
        </Link>
      </div>

      {/* Stats Cards — Clickable */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            to={href}
            className="rounded-md border border-ink/10 bg-white p-5 shadow-soft hover:shadow-md hover:border-forest/30 transition-all group"
          >
            <span className={`inline-grid h-10 w-10 place-items-center rounded-md ${color}`}>
              <Icon size={20} />
            </span>
            <p className="mt-4 text-3xl font-black group-hover:text-forest transition-colors">
              {value}
            </p>
            <p className="text-sm font-semibold text-ink/60">{label}</p>
            <p className="text-xs text-forest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View all →
            </p>
          </Link>
        ))}
      </div>

      {/* Total Views */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="font-black">Total Views</h2>
          <p className="mt-2 text-4xl font-black text-forest">
            {stats?.totalViews ?? 0}
          </p>
          <p className="text-sm text-ink/50 mt-1">Across all published blogs</p>
        </div>

        {/* Quick Actions */}
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="font-black mb-4">Quick Actions</h2>
          <div className="grid gap-2">
            <Link to="/admin/blogs/new" className="btn-primary text-sm text-center">
              ✍️ Write New Blog
            </Link>
            <Link to="/admin/contacts" className="btn-secondary text-sm text-center">
              📬 View Messages
            </Link>
            <Link to="/admin/categories" className="btn-secondary text-sm text-center">
              📂 Manage Categories
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}