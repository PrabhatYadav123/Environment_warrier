import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async"; // ← Add
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

      {/* SEO Meta Tags */}
      <Helmet>
        <title>Blogs | Environment Warrior — Climate Stories & Resources</title>
        <meta name="description" content="Read the latest blogs on climate change, conservation, community action and sustainability from Environment Warrior Group." />
        <meta name="keywords" content="environment blogs, climate change articles, conservation stories, sustainability India, green community" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blogs | Environment Warrior — Climate Stories & Resources" />
        <meta property="og:description" content="Read the latest blogs on climate change, conservation, community action and sustainability." />
        <meta property="og:url" content="https://environment-warrior.vercel.app/blogs" />
        <meta property="og:image" content="https://environment-warrior.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blogs | Environment Warrior — Climate Stories & Resources" />
        <meta name="twitter:description" content="Read the latest blogs on climate change, conservation, community action and sustainability." />
        <meta name="twitter:image" content="https://environment-warrior.vercel.app/og-image.jpg" />

        {/* Canonical — page change hone pe bhi sahi URL rahega */}
        <link rel="canonical" href="https://environment-warrior.vercel.app/blogs" />
      </Helmet>

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