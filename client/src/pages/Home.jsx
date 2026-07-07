import {
  ArrowRight,
  Calendar,
  Clock3,
  Eye,
  Heart,
  Newspaper,
  Sprout,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // ← Add
import BlogCard from "../components/BlogCard.jsx";
import api from "../services/api";

export default function Home() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/blogs?limit=7").then(({ data }) => setBlogs(data.items)).catch(() => setBlogs([]));
  }, []);

  const featuredBlog = blogs.length ? blogs[0] : null;
const latestBlogs = blogs.slice(1);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Environment Warrior | Climate Stories, Campaigns & Community Action</title>
        <meta name="description" content="Environment Warrior Group publishes blogs, photos, videos and audio updates on climate change, conservation, and community action for a cleaner planet." />
        <meta name="keywords" content="environment, climate change, conservation, community action, green planet, sustainability, environmental blogs India" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Environment Warrior | Climate Stories & Community Action" />
        <meta property="og:description" content="Read climate stories, conservation guides and community action updates from Environment Warrior Group." />
        <meta property="og:url" content="https://environment-warrior.vercel.app/" />
        <meta property="og:image" content="https://cdn.uploadtourl.com/30e30efd-6fc1-4563-b5db-0aff9025742e_Environment.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Environment Warrior | Climate Stories & Community Action" />
        <meta name="twitter:description" content="Read climate stories, conservation guides and community action updates from Environment Warrior Group." />
        <meta name="twitter:image" content="https://environment-warrior.vercel.app/og-image.jpg" />

        {/* Canonical */}
        <link rel="canonical" href="https://environment-warrior.vercel.app/" />
      </Helmet>

     <section
  className="relative overflow-hidden bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80')",
  }}
>
  <div className="absolute inset-0 bg-black/65" />

  <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-36">

    <div className="max-w-3xl">

      <span className="inline-flex items-center rounded-full bg-green-600/20 px-4 py-2 text-sm font-semibold text-green-300 backdrop-blur">
        🌍 Together For A Greener Tomorrow
      </span>

      <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
        Protect Nature.
        <br />
        Inspire Action.
      </h1>

      <p className="mt-8 text-lg leading-8 text-gray-200 md:text-xl">
        Environment Warrior is a community dedicated to climate awareness,
        conservation, sustainable living and environmental action.
        Discover inspiring stories, campaigns and practical ideas that
        help create a healthier planet.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">

        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-7 py-4 font-semibold text-white transition hover:bg-green-700"
        >
          Explore Blogs
          <ArrowRight size={18} />
        </Link>

        <Link
          to="/contact"
          className="rounded-lg border border-white/40 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-black"
        >
          Join Community
        </Link>

      </div>

    </div>

    <div className="mt-20 grid gap-6 md:grid-cols-4">

      <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
        <h2 className="text-4xl font-bold text-white">500+</h2>
        <p className="mt-2 text-green-200">
          Environmental Blogs
        </p>
      </div>

      <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
        <h2 className="text-4xl font-bold text-white">50+</h2>
        <p className="mt-2 text-green-200">
          Awareness Campaigns
        </p>
      </div>

      <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
        <h2 className="text-4xl font-bold text-white">10K+</h2>
        <p className="mt-2 text-green-200">
          Monthly Readers
        </p>
      </div>

      <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
        <h2 className="text-4xl font-bold text-white">100+</h2>
        <p className="mt-2 text-green-200">
          Volunteers
        </p>
      </div>

    </div>

  </div>
</section>
    <section className="bg-gray-50 py-20">
  <div className="mx-auto max-w-7xl px-6">

    <div className="mb-14 flex items-end justify-between">

      <div>

        <p className="text-sm font-bold uppercase tracking-widest text-green-600">
          Latest Articles
        </p>

        <h2 className="mt-2 text-4xl font-extrabold text-gray-900">
          Environmental Stories
        </h2>

      </div>

      <Link
        to="/blogs"
        className="rounded-lg border px-5 py-3 font-semibold transition hover:bg-green-600 hover:text-white"
      >
        View All
      </Link>

    </div>

    {featuredBlog && (
      <Link
        to={`/blog/${featuredBlog.slug}`}
        className="group mb-14 grid overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl lg:grid-cols-2"
      >
        <div className="overflow-hidden">

          <img
            src={featuredBlog.featuredImage?.url}
            alt={featuredBlog.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

        </div>

        <div className="flex flex-col justify-center p-10">

          <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            🌍 Featured Story
          </span>

          <h3 className="text-4xl font-black text-gray-900">
            {featuredBlog.title}
          </h3>

          <p className="mt-6 line-clamp-4 text-lg leading-8 text-gray-600">
            {featuredBlog.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">

            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(featuredBlog.createdAt)}
            </span>

            <span className="flex items-center gap-2">
              <Clock3 size={16} />
              {featuredBlog.readingTime || 5} min
            </span>
          </div>

          <div className="mt-8 flex items-center gap-2 font-semibold text-green-700">
            Read Full Story
            <ArrowRight size={18} />
          </div>

        </div>
      </Link>
    )}

    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      {latestBlogs.map((blog) => (

        <Link
          key={blog._id}
          to={`/blog/${blog.slug}`}
          className="group overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-2 hover:shadow-xl"
        >

          <div className="overflow-hidden">

            <img
              src={blog.featuredImage?.url}
              alt={blog.title}
              className="h-60 w-full object-cover transition duration-500 group-hover:scale-110"
            />

          </div>

          <div className="p-6">

            <div className="mb-3 flex items-center justify-between">

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                {blog.category?.name || "Environment"}
              </span>

              <span className="text-xs text-gray-500">
                {formatDate(blog.createdAt)}
              </span>

            </div>

            <h3 className="line-clamp-2 text-xl font-bold text-gray-900 transition group-hover:text-green-700">
              {blog.title}
            </h3>

            <p className="mt-3 line-clamp-3 text-gray-600">
              {blog.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">

              <span className="flex items-center gap-1">
                <Clock3 size={15} />
                {blog.readingTime || 5} min
              </span>

            </div>

            <div className="mt-6 flex items-center justify-between">

              <span className="text-sm text-gray-500">
                By {blog.author?.name || "Environment Warrior"}
              </span>

              <span className="flex items-center gap-2 font-semibold text-green-700">
                Read
                <ArrowRight size={16} />
              </span>

            </div>

          </div>

        </Link>

      ))}

    </div>

  </div>
</section>
    </>
  );
}