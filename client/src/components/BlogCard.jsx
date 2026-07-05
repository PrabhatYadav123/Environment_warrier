import { Heart, Share2, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, shareBlog } from "../utils/format";

export default function BlogCard({ blog }) {
  return (
    <article className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft hover:shadow-md transition-shadow duration-300 group">

      {/* Image */}
      <div className="relative overflow-hidden">
        {blog.featuredImage?.url ? (
          <img
            src={blog.featuredImage.url}
            alt={blog.title}
            className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="grid h-52 place-items-center bg-gradient-to-br from-forest to-leaf text-white">
            <span className="px-8 text-center text-xl font-black">{blog.title}</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 text-forest text-xs font-bold px-2 py-1 rounded-full">
          {blog.category?.name || "Environment"}
        </span>
      </div>

      {/* Content */}
      <div className="grid gap-3 p-5">

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {blog.readingTime} min read
          </span>
          <span>{formatDate(blog.createdAt)}</span>
          {blog.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={12} /> {blog.views}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/blog/${blog.slug}`}
          className="text-xl font-black leading-snug hover:text-forest transition-colors line-clamp-2"
        >
          {blog.title}
        </Link>

        {/* Excerpt */}
        <p className="line-clamp-2 text-sm leading-6 text-ink/70">
          {blog.excerpt || blog.subtitle}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-ink/5">
          <span className="inline-flex items-center gap-1 text-sm text-ink/50">
            <Heart size={15} /> {blog.likes || 0}
          </span>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-forest transition-colors"
              onClick={() => shareBlog(blog)}
            >
              <Share2 size={15} /> Share
            </button>
            <Link
              to={`/blog/${blog.slug}`}
              className="text-sm font-semibold text-forest hover:underline"
            >
              Read →
            </Link>
          </div>
        </div>

      </div>
    </article>
  );
}