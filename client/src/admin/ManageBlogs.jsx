import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatDate } from "../utils/format";

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);

  async function load() {
    const { data } = await api.get("/blogs?includeDrafts=true&limit=100");
    setBlogs(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Delete this blog?")) return;
    await api.delete(`/blogs/${id}`);
    load();
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-forest">Blogs</p>
          <h1 className="text-3xl font-black">Manage Blogs</h1>
        </div>
        <Link to="/admin/blogs/new" className="btn-primary">
          <Plus size={18} /> New Blog
        </Link>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-mist text-ink/70">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Views</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-t border-ink/10">
                <td className="p-3 font-semibold">{blog.title}</td>
                <td className="p-3">{blog.category?.name || "-"}</td>
                <td className="p-3">
                  <span className="rounded-md bg-forest/10 px-2 py-1 text-xs font-bold uppercase text-forest">{blog.status}</span>
                </td>
                <td className="p-3">{blog.views}</td>
                <td className="p-3">{formatDate(blog.createdAt)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/admin/blogs/${blog._id}/edit`} className="btn-secondary px-3" aria-label="Edit">
                      <Edit size={16} />
                    </Link>
                    <button className="btn-secondary px-3 text-red-700" onClick={() => remove(blog._id)} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
