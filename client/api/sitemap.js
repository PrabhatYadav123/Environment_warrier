// api/sitemap.js
import mongoose from "mongoose";

// MongoDB direct connect karo
const MONGO_URI = process.env.MONGO_URI;

// Blog Schema
const blogSchema = new mongoose.Schema({
  slug: String,
  status: String,
  updatedAt: Date
}, { timestamps: true });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}

export default async function handler(req, res) {
  try {
    await connectDB();

    const blogs = await Blog.find({ status: "published" })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const baseUrl = "https://environment-warrior.vercel.app";

    const staticPages = [
      { url: "/",        changefreq: "daily",   priority: "1.0" },
      { url: "/blogs",   changefreq: "daily",   priority: "0.9" },
      { url: "/about",   changefreq: "monthly", priority: "0.7" },
      { url: "/gallery", changefreq: "weekly",  priority: "0.6" },
      { url: "/videos",  changefreq: "weekly",  priority: "0.6" },
      { url: "/contact", changefreq: "monthly", priority: "0.5" },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
${blogs.map(blog => `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).json({ error: error.message });
  }
}