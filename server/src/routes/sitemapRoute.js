import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 });

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
${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("")}
${blogs.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;