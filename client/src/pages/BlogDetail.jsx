import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // ← Add
import api from "../services/api";
import { formatDate, shareBlog } from "../utils/format";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/blogs/${slug}`)
      .then(({ data }) => setBlog(data))
      .finally(() => setLoading(false));
  }, [slug]);

  async function like() {
    const { data } = await api.post(`/blogs/${blog._id}/like`);
    setBlog((current) => ({ ...current, likes: data.likes }));
  }

  const description =
    blog?.subtitle ||
    blog?.excerpt ||
    blog?.content?.replace(/<[^>]+>/g, "").substring(0, 160) ||
    "";

  const keywords = [
    "environment",
    "climate change",
    "sustainability",
    "environment warrior",
    blog?.category?.name,
    ...(blog?.tags || []),
  ]
    .filter(Boolean)
    .join(", ");

  const canonical = `https://environment-warrior.vercel.app/blog/${slug}`;

  const structuredData = blog
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",

        headline: blog.title,

        description,

        image: blog.featuredImage?.url,

        author: {
          "@type": "Person",
          name: blog.author?.name || "Environment Warrior",
        },

        publisher: {
          "@type": "Organization",
          name: "Environment Warrior",
          logo: {
            "@type": "ImageObject",
            url: "https://environment-warrior.vercel.app/logo.png",
          },
        },

        mainEntityOfPage: canonical,

        datePublished: blog.createdAt,

        dateModified: blog.updatedAt,

        articleSection: blog.category?.name,

        keywords,
      }
    : null;

  if (loading)
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">Loading...</section>
    );
  if (!blog)
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        Blog not found.
      </section>
    );

  return (
    <article className="bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.title} | Environment Warrior</title>

        <meta name="description" content={description} />

        <meta name="keywords" content={keywords} />

        <meta
          name="author"
          content={blog.author?.name || "Environment Warrior"}
        />

        <meta name="robots" content="index, follow" />

        <meta name="theme-color" content="#16a34a" />

        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="article" />

        <meta property="og:site_name" content="Environment Warrior" />

        <meta property="og:title" content={blog.title} />

        <meta property="og:description" content={description} />

        <meta property="og:url" content={canonical} />

        {blog.featuredImage?.url && (
          <meta property="og:image" content={blog.featuredImage.url} />
        )}

        <meta property="article:published_time" content={blog.createdAt} />

        <meta property="article:modified_time" content={blog.updatedAt} />

        <meta property="article:section" content={blog.category?.name} />

        <meta property="article:author" content={blog.author?.name} />

        {blog.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={blog.title} />

        <meta name="twitter:description" content={description} />

        {blog.featuredImage?.url && (
          <meta name="twitter:image" content={blog.featuredImage.url} />
        )}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/blogs" className="text-sm font-bold text-forest">
          Back to blogs
        </Link>
        <div className="mt-5 grid gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-forest">
            {blog.category?.name || "Environment"}
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            {blog.title}
          </h1>
          {blog.subtitle && (
            <p className="text-xl leading-8 text-ink/70">{blog.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-ink/60">
            <span>{formatDate(blog.createdAt)}</span>
            <span>{blog.readingTime} min read</span>
            {blog.author?.name && <span>By {blog.author.name}</span>}
            <span>{blog.views} views</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={like}>
              <Heart size={18} /> {blog.likes || 0}
            </button>
            <button className="btn-secondary" onClick={() => shareBlog(blog)}>
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </div>
      {blog.featuredImage?.url && (
        <img
          src={blog.featuredImage.url}
          alt={`${blog.title} - Environment Warrior`}
          loading="eager"
          decoding="async"
          className="h-[420px] w-full object-contain px-8 rounded-xl"
        />
      )}
      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10">
        <div
          className="prose max-w-none prose-headings:text-ink prose-a:text-forest"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {blog.galleryImages?.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {blog.galleryImages.map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={`${blog.title} image`}
                loading="lazy"
                decoding="async"
                className="rounded-md object-cover"
              />
            ))}
          </div>
        )}
        {blog.video?.url && (
          <video src={blog.video.url} controls className="w-full rounded-md" />
        )}
        {blog.audio?.url && (
          <audio src={blog.audio.url} controls className="w-full" />
        )}
      </div>
    </article>
  );
}
