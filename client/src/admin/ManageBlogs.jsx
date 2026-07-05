import {
  Edit,
  Plus,
  Search,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { formatDate } from "../utils/format";

export default function ManageBlogs() {
  const location = useLocation();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);

      const params = new URLSearchParams(location.search);

      const status = params.get("status");

      let url = "/blogs?includeDrafts=true&limit=100";

      if (status) {
        url += `&status=${status}`;
      }

      const { data } = await api.get(url);

      setBlogs(data.items || []);
    } catch (err) {
      setError("Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [location.search]);

  async function remove(id) {
    if (!window.confirm("Delete this blog?")) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await api.delete(`/blogs/${id}`);

      setMessage("Blog deleted successfully.");

      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete blog.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) =>
      blog.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

  const publishedCount = blogs.filter(
    (blog) => blog.status === "published"
  ).length;

  const draftCount = blogs.filter(
    (blog) => blog.status === "draft"
  ).length;

  if (loading) {
    return (
      <section className="grid gap-6">
        <div className="rounded-md bg-white p-8 text-center shadow-soft">
          Loading blogs...
        </div>
      </section>
    );
  }

  const statusClass = {
    published:
      "bg-green-100 text-green-700 border border-green-200",

    draft:
      "bg-yellow-100 text-yellow-700 border border-yellow-200",
  };

  return (
  <section className="grid gap-6">
    {/* Header */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">
          Blogs
        </p>
        <h1 className="text-3xl font-black">Manage Blogs</h1>
      </div>

      <Link to="/admin/blogs/new" className="btn-primary">
        <Plus size={18} />
        New Blog
      </Link>
    </div>

    {/* Stats */}
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-md bg-white p-5 shadow-soft">
        <p className="text-sm text-gray-500">Total Blogs</p>
        <h2 className="mt-2 text-3xl font-black">{blogs.length}</h2>
      </div>

      <div className="rounded-md bg-white p-5 shadow-soft">
        <p className="text-sm text-gray-500">Published</p>
        <h2 className="mt-2 text-3xl font-black text-green-600">
          {publishedCount}
        </h2>
      </div>

      <div className="rounded-md bg-white p-5 shadow-soft">
        <p className="text-sm text-gray-500">Drafts</p>
        <h2 className="mt-2 text-3xl font-black text-yellow-600">
          {draftCount}
        </h2>
      </div>
    </div>

    {/* Messages */}
    {message && (
      <div className="rounded-md bg-green-50 p-3 font-semibold text-green-700">
        {message}
      </div>
    )}

    {error && (
      <div className="rounded-md bg-red-50 p-3 font-semibold text-red-700">
        {error}
      </div>
    )}

    {/* Search */}
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        className="field pl-10"
        placeholder="Search blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* Empty */}
    {filteredBlogs.length === 0 ? (
      <div className="rounded-md bg-white p-12 text-center shadow-soft">
        <FileText
          size={60}
          className="mx-auto mb-4 text-gray-300"
        />

        <h2 className="text-xl font-bold">
          No Blogs Found
        </h2>

        <p className="mt-2 text-gray-500">
          Try another search or create a new blog.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Blog</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Views</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBlogs.map((blog) => (
              <tr
                key={blog._id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {blog.featuredImage?.url ? (
                      <img
                        src={blog.featuredImage.url}
                        alt={blog.title}
                        className="h-16 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="grid h-16 w-20 place-items-center rounded bg-gray-100">
                        <FileText
                          size={24}
                          className="text-gray-400"
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold">
                        {blog.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {blog.excerpt || "No excerpt"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {blog.category?.name || "-"}
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      statusClass[blog.status]
                    }`}
                  >
                    {blog.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    {blog.views}
                  </div>
                </td>

                <td className="p-4">
                  {formatDate(blog.createdAt)}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/admin/blogs/${blog._id}/edit`}
                      className="btn-secondary"
                    >
                      <Edit size={16} />
                    </Link>

                    <button
                      disabled={deletingId === blog._id}
                      onClick={() => remove(blog._id)}
                      className="btn-secondary text-red-700"
                    >
                      {deletingId === blog._id ? (
                        "Deleting..."
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </section>

  );

}