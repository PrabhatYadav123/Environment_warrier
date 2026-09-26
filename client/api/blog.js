const SITE_ORIGIN = "https://environmentwarrior.in";
const DEFAULT_API_ORIGIN = "https://environment-warrier.onrender.com/api";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toPlainText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}

function articleParagraphs(content) {
  const text = toPlainText(content);
  if (!text) return "";

  // The client supports rich text. For the server-rendered fallback we emit
  // escaped text only, so untrusted post HTML can never become executable HTML.
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const groups = [];
  for (let index = 0; index < sentences.length; index += 4) {
    groups.push(sentences.slice(index, index + 4).join(" ").trim());
  }
  return groups.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
}

function pageShell({ title, description, canonical, body, structuredData, image }) {
  const socialImage = image
    ? `<meta property="og:image" content="${escapeHtml(image)}">`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Environment Warrior">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    ${socialImage}
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${jsonForScript(structuredData)}</script>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; color: #1f2937; }
      body { margin: 0; background: #f8faf8; } header, main, footer { max-width: 760px; margin: auto; padding: 24px; }
      header { max-width: none; background: #14532d; } header nav { max-width: 760px; margin: auto; }
      a { color: #166534; } header a { color: white; margin-right: 18px; text-decoration: none; font-weight: 700; }
      article { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 1px 3px #0001; }
      h1 { line-height: 1.15; font-size: clamp(2rem, 5vw, 3.5rem); margin: 12px 0; }
      .meta, .category { color: #4b5563; } .category { color: #166534; font-weight: 700; text-transform: uppercase; }
      img { width: 100%; height: auto; border-radius: 10px; margin: 16px 0; } p { font-size: 1.1rem; line-height: 1.8; }
      footer { color: #4b5563; font-size: .9rem; }
    </style>
  </head>
  <body>
    <header><nav><a href="/">Environment Warrior</a><a href="/blogs">Stories</a><a href="/about">About</a><a href="/contact">Contact</a></nav></header>
    <main>${body}</main>
    <footer>© Environment Warrior</footer>
  </body>
</html>`;
}

export default async function handler(req, res) {
  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    res.status(404).setHeader("X-Robots-Tag", "noindex");
    res.send("Not found");
    return;
  }

  const apiOrigin = (process.env.BACKEND_API_URL || process.env.VITE_API_URL || DEFAULT_API_ORIGIN).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiOrigin}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" }
    });

    if (response.status === 404) {
      res.status(404).setHeader("X-Robots-Tag", "noindex");
      res.send("Not found");
      return;
    }
    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);

    const blog = await response.json();
    const canonical = `${SITE_ORIGIN}/blog/${encodeURIComponent(blog.slug)}`;
    const description = toPlainText(blog.subtitle || blog.excerpt || blog.content).slice(0, 160);
    const image = blog.featuredImage?.url;
    const title = `${blog.title} | Environment Warrior`;
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description,
      mainEntityOfPage: canonical,
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt,
      image,
      author: { "@type": "Person", name: blog.author?.name || "Environment Warrior" },
      publisher: {
        "@type": "Organization",
        name: "Environment Warrior",
        logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/logo512.png` }
      }
    };
    const body = `<article>
      <p class="category">${escapeHtml(blog.category?.name || "Environment")}</p>
      <h1>${escapeHtml(blog.title)}</h1>
      ${blog.subtitle ? `<p>${escapeHtml(blog.subtitle)}</p>` : ""}
      <p class="meta">${escapeHtml(formatDate(blog.createdAt))}${blog.author?.name ? ` · By ${escapeHtml(blog.author.name)}` : ""}${blog.readingTime ? ` · ${escapeHtml(blog.readingTime)} min read` : ""}</p>
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(blog.title)}">` : ""}
      ${articleParagraphs(blog.content)}
    </article>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(pageShell({ title, description, canonical, body, structuredData, image }));
  } catch (error) {
    console.error("Blog renderer error", error);
    res.status(503).setHeader("X-Robots-Tag", "noindex");
    res.send("Service temporarily unavailable");
  }
}
