import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

  if (loading) return <section className="mx-auto max-w-4xl px-4 py-12">Loading...</section>;
  if (!blog) return <section className="mx-auto max-w-4xl px-4 py-12">Blog not found.</section>;

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/blogs" className="text-sm font-bold text-forest">
          Back to blogs
        </Link>
        <div className="mt-5 grid gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-forest">{blog.category?.name || "Environment"}</p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">{blog.title}</h1>
          {blog.subtitle && <p className="text-xl leading-8 text-ink/70">{blog.subtitle}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-ink/60">
            <span>{formatDate(blog.createdAt)}</span>
            <span>{blog.readingTime} min read</span>
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
      {blog.featuredImage?.url && <img src={blog.featuredImage.url} alt={blog.title} className="h-[420px] w-full object-cover" />}
      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10">
        <div className="prose max-w-none prose-headings:text-ink prose-a:text-forest" dangerouslySetInnerHTML={{ __html: blog.content }} />
        {blog.galleryImages?.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {blog.galleryImages.map((image) => (
              <img key={image.url} src={image.url} alt={image.originalName || blog.title} className="rounded-md object-cover" />
            ))}
          </div>
        )}
        {blog.video?.url && <video src={blog.video.url} controls className="w-full rounded-md" />}
        {blog.audio?.url && <audio src={blog.audio.url} controls className="w-full" />}
      </div>
    </article>
  );
}
