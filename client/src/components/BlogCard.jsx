import { Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, shareBlog } from "../utils/format";

export default function BlogCard({ blog }) {
  return (
    <article className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
      {blog.featuredImage?.url ? (
        <img src={blog.featuredImage.url} alt={blog.title} className="h-52 w-full object-cover" />
      ) : (
        <div className="grid h-52 place-items-center bg-gradient-to-br from-forest to-leaf text-white">
          <span className="px-8 text-center text-xl font-black">{blog.title}</span>
        </div>
      )}
      <div className="grid gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-forest">
          <span>{blog.category?.name || "Environment"}</span>
          <span>{formatDate(blog.createdAt)}</span>
          <span>{blog.readingTime} min read</span>
        </div>
        <Link to={`/blog/${blog.slug}`} className="text-xl font-black hover:text-forest">
          {blog.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-ink/70">{blog.excerpt || blog.subtitle}</p>
        <div className="flex items-center justify-between pt-2 text-sm text-ink/60">
          <span className="inline-flex items-center gap-1">
            <Heart size={16} /> {blog.likes || 0}
          </span>
          <button className="inline-flex items-center gap-1 hover:text-forest" onClick={() => shareBlog(blog)}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </article>
  );
}
