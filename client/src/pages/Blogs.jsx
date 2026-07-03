import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard.jsx";
import BlogFilters from "../components/BlogFilters.jsx";
import api from "../services/api";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api.get(`/blogs?${params}`).then(({ data }) => {
      setBlogs(data.items);
      setPages(data.pages || 1);
    });
  }, [search, category, page]);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest">
          Blogs
        </p>
        <h1 className="text-4xl font-black">Stories and Resources</h1>
      </div>
      <BlogFilters
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        category={category}
        setCategory={(value) => {
          setCategory(value);
          setPage(1);
        }}
        categories={categories}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
      {blogs.length === 0 && (
        <p className="rounded-md bg-white p-6 text-ink/60">No blogs found.</p>
      )}
      {blogs.length >= 6 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn-secondary cursor-pointer"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>
          <span className="text-sm font-semibold">
            Page {page} of {pages}
          </span>
          <button
            className="btn-secondary cursor-pointer"
            disabled={page >= pages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
