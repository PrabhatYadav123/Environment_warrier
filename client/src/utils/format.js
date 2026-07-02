export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export function shareBlog(blog) {
  const url = `${window.location.origin}/blog/${blog.slug}`;
  if (navigator.share) {
    return navigator.share({ title: blog.title, text: blog.excerpt, url });
  }
  return navigator.clipboard.writeText(url);
}
