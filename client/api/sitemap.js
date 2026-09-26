const DEFAULT_API_ORIGIN = "https://environment-warrier.onrender.com/api";

function sitemapOrigin() {
  const apiOrigin = process.env.BACKEND_API_URL || process.env.VITE_API_URL || DEFAULT_API_ORIGIN;
  return apiOrigin.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export default async function handler(_req, res) {
  try {
    const response = await fetch(`${sitemapOrigin()}/sitemap.xml`, {
      headers: { Accept: "application/xml, text/xml" }
    });

    if (!response.ok) {
      throw new Error(`Backend sitemap returned ${response.status}`);
    }

    // Use one canonical host and correct the former root URL with two slashes.
    const xml = (await response.text()).replaceAll(
      "https://environmentwarrior.in//",
      "https://environmentwarrior.in/"
    );

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap proxy error", error);
    res.status(503).json({ message: "Sitemap is temporarily unavailable." });
  }
}
