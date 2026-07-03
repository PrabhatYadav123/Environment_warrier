import { ArrowRight, Newspaper, Sprout, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // ← Add
import BlogCard from "../components/BlogCard.jsx";
import api from "../services/api";

export default function Home() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/blogs?limit=3").then(({ data }) => setBlogs(data.items)).catch(() => setBlogs([]));
  }, []);

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

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="grid gap-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-forest">Environment Warrior Group</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-ink md:text-6xl">
              A CMS for climate stories, campaigns and community action.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              Publish blogs, photos, videos and audio updates from one simple admin panel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/blogs" className="btn-primary">
                Read Blogs <ArrowRight size={18} />
              </Link>
              <Link to="/admin" className="btn-secondary">
                Open CMS
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-md border border-ink/10 bg-mist p-5 shadow-soft">
            {[
              [Sprout, "Conservation", "Guides and field updates for practical change."],
              [Users, "Community", "Volunteer stories, events and cleanup drives."],
              [Newspaper, "Publishing", "Rich posts with images, video and audio."]
            ].map(([Icon, title, text]) => (
              <div key={title} className="flex gap-4 rounded-md bg-white p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-forest text-white">
                  <Icon size={22} />
                </span>
                <div>
                  <h2 className="font-black">{title}</h2>
                  <p className="text-sm leading-6 text-ink/65">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-forest">Featured</p>
            <h2 className="text-3xl font-black">Latest Stories</h2>
          </div>
          <Link to="/blogs" className="btn-secondary">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      </section>
    </>
  );
}