import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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

  // ================= SEO =================

  const canonical = `https://environment-warrior.vercel.app/blogs${
    page > 1 ? `?page=${page}` : ""
  }`;

  const pageTitle =
    page > 1
      ? `Blogs - Page ${page} | Environment Warrior`
      : "Blogs | Environment Warrior - Climate Stories & Resources";

  const metaDescription = search
    ? `Browse blogs related to "${search}" from Environment Warrior. Read articles about climate change, sustainability, conservation and environmental awareness.`
    : category
    ? `Explore environmental blogs in the selected category from Environment Warrior.`
    : "Read the latest blogs on climate change, sustainability, conservation, renewable energy, wildlife, pollution and community action from Environment Warrior.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Environment Warrior Blogs",
    url: canonical,
    description: metaDescription,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "Environment Warrior",
      url: "https://environment-warrior.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://environment-warrior.vercel.app/logo.png",
      },
    },
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10">
      <Helmet>
        {/* Basic SEO */}
        <title>{pageTitle}</title>

        <meta name="description" content={metaDescription} />

        <meta
          name="keywords"
          content="environment, climate change, sustainability, renewable energy, pollution, wildlife, conservation, blogs, India, green living"
        />

        <meta name="author" content="Environment Warrior" />

        <meta name="robots" content="index,follow" />

        <meta name="theme-color" content="#15803d" />

        {/* Canonical */}
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Environment Warrior" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta
          property="og:image"
          content="https://environment-warrior.vercel.app/og-image.jpg"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content="https://environment-warrior.vercel.app/og-image.jpg"
        />

        {/* Pagination */}
        {page > 1 && (
          <link
            rel="prev"
            href={`https://environment-warrior.vercel.app/blogs?page=${page - 1}`}
          />
        )}

        {page < pages && (
          <link
            rel="next"
            href={`https://environment-warrior.vercel.app/blogs?page=${page + 1}`}
          />
        )}

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
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
        <p className="rounded-md bg-white p-6 text-ink/60">
          No blogs found.
        </p>
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