import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // ← Add
import api from "../services/api";
import { formatDate, shareBlog } from "../utils/format";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);

useEffect(() => {
  async function fetchBlog() {
    try {
      const { data } = await api.get(`/blogs/${slug}`);

      setBlog(data);

      // Like status
      const alreadyLiked = localStorage.getItem(`liked-${data._id}`);
      if (alreadyLiked) {
        setLiked(true);
      }

      // View count (only once every 24 hours)
      const viewKey = `viewed-${data._id}`;
      const lastViewed = localStorage.getItem(viewKey);

      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (!lastViewed || now - Number(lastViewed) > oneDay) {
        await api.post(`/blogs/${data._id}/view`);

        localStorage.setItem(viewKey, now.toString());
      }
    } finally {
      setLoading(false);
    }
  }

  fetchBlog();
}, [slug]);
  async function like() {
    if (liked) return;

    const { data } = await api.post(`/blogs/${blog._id}/like`);

    setBlog((current) => ({
      ...current,
      likes: data.likes,
    }));

    localStorage.setItem(`liked-${blog._id}`, "true");

    setLiked(true);
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
            url: "https://environment-warrior.vercel.app/logo512.png",
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
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            {blog.title}
          </h1>
          {blog.subtitle && (
            <p className="text-xl leading-8 text-ink/70">{blog.subtitle}</p>
          )}
          {blog.excerpt && (
            <p className="mt-4 text-lg italic text-gray-600 border-l-4 border-green-600 pl-4">
              {blog.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm border-b pb-6">
            <span>{formatDate(blog.createdAt)}</span>
            <span>{blog.readingTime} min read</span>
            {blog.author?.name && <span>By {blog.author.name}</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={like}
              disabled={liked}
              className={`btn-secondary transition ${
                liked
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-green-600 hover:text-white"
              }`}
            >
              <Heart
                size={18}
                className={liked ? "fill-red-500 text-red-500" : ""}
              />

              {blog.likes || 0}
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
          className="w-full object-cover shadow-xl max-h-[550px]"
        />
      )}
      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10">
        <hr className="my-10 border-gray-200" />
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          className="prose prose-lg lg:prose-xl max-w-none
    prose-headings:font-bold
    prose-headings:text-gray-900
    prose-p:text-gray-700
    prose-p:leading-8
    prose-li:leading-8
    prose-strong:text-black
    prose-a:text-green-700
    prose-blockquote:border-l-4
    prose-blockquote:border-green-600
    prose-blockquote:bg-green-50
    prose-blockquote:py-2
    prose-blockquote:px-4
    prose-img:rounded-xl
    prose-img:shadow-lg
    prose-table:border
    prose-th:border
    prose-td:border
    prose-code:text-red-600"
        >
          {blog.content}
        </ReactMarkdown>
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {blog.galleryImages?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {blog.galleryImages.map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={`${blog.title} image`}
                loading="lazy"
                decoding="async"
                className="rounded-xl shadow-lg w-full h-72 object-cover hover:scale-[1.02] transition"
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
