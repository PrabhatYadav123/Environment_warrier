require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v2: cloudinary } = require("cloudinary");
const { postToInstagram, buildCaption } = require("./instagram");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BLOG_API_URL = process.env.BLOG_API_URL;
const BLOG_API_TOKEN = process.env.BLOG_API_TOKEN;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fetchOrCreateCategory(categoryName) {
  const res = await axios.get(`${BLOG_API_URL}/api/categories`);
  const match = res.data.find(
    (c) => c.name?.toLowerCase() === categoryName.toLowerCase(),
  );
  if (match) return match._id;

  const created = await axios.post(
    `${BLOG_API_URL}/api/categories`,
    { name: categoryName },
    { headers: { Authorization: `Bearer ${BLOG_API_TOKEN}` } },
  );
  return created.data._id;
}

// ─────────────────────────────────────────────────────────────
// NEW: fetch recent blog titles so we can avoid repeating topics
// ─────────────────────────────────────────────────────────────
async function fetchRecentBlogTitles(limit = 30) {
  try {
    const res = await axios.get(
      `${BLOG_API_URL}/api/blogs?limit=${limit}&sort=-createdAt`,
    );
    // Confirmed actual API shape: { items: [...], total, page, pages }
    const titles = (res.data.items || []).map((b) => b.title);
    console.log(`📚 Fetched ${titles.length} recent titles for dedup context`);
    return titles;
  } catch (err) {
    console.log(`⚠️ Couldn't fetch recent titles: ${err.message}`);
    return [];
  }
}

const TOPICS = [
  "climate change India 2026",
  "air pollution India",
  "renewable energy solar India",
  "deforestation wildlife India",
  "water conservation India",
  "plastic pollution ocean",
  "flood drought India",
  "electric vehicles India",
  "monsoon agriculture India",
  "coastal erosion sea level India",
  "urban heat island cities India",
  "biodiversity conservation India",
  "e-waste recycling India",
  "carbon credits climate policy India",
  "sustainable agriculture organic farming India",
  "wildlife corridor conservation India",
  "river pollution India",
  "Himalayan glacier melt India",
  "green building sustainable architecture India",
  "circular economy waste management India",
];

// ─────────────────────────────────────────────────────────────
// NEW: avoid picking a topic whose keyword already appears in
// recently published titles
// ─────────────────────────────────────────────────────────────
function pickTopic(recentTitles) {
  const lowerTitles = recentTitles.map((t) => t.toLowerCase());

  const availableTopics = TOPICS.filter((topic) => {
    const keyword = topic.split(" ")[0].toLowerCase();
    return !lowerTitles.some((title) => title.includes(keyword));
  });

  const pool = availableTopics.length > 0 ? availableTopics : TOPICS;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  console.log(
    `🎯 Topic pool size: ${pool.length}/${TOPICS.length} (filtered by recent titles)`,
  );
  return chosen;
}

async function fetchEnvironmentNews(recentTitles) {
  console.log("📰 Fetching environment news...");

  const randomTopic = pickTopic(recentTitles);
  console.log(`Topic: ${randomTopic}`);

  try {
    const res = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: randomTopic,
        lang: "en",
        max: 7,
        apikey: GNEWS_API_KEY,
      },
    });

    if (res.data.articles?.length > 0) {
      console.log(`Found ${res.data.articles.length} articles`);
      return res.data.articles;
    }
  } catch (err) {
    console.log(`GNews failed: ${err.message}`);
  }

  console.log("⚠️ Using fallback news context...");
  return [
    {
      title: "India's Climate Crisis: Rising Temperatures Threaten Millions",
      description:
        "India faces unprecedented climate challenges in 2026 with record temperatures, erratic monsoons, and increasing extreme weather events affecting agriculture and public health.",
    },
    {
      title: "Air Pollution in Indian Cities Reaches Critical Levels",
      description:
        "Multiple Indian cities report dangerous AQI levels, prompting health advisories and calls for stricter emission controls across industrial and transport sectors.",
    },
    {
      title: "Solar Energy Expansion Accelerates Across Rural India",
      description:
        "India's renewable energy push gains momentum as solar installations in rural areas provide clean electricity to millions previously dependent on diesel generators.",
    },
  ];
}

async function generateBlog(articles, recentTitles) {
  console.log("✍️ Generating blog with Gemini...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.85, // bumped up slightly from 0.7 for more variety
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const newsContext = articles
    .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description}`)
    .join("\n\n");

  const recentTitlesBlock =
    recentTitles.length > 0
      ? recentTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")
      : "None yet — this is one of the first articles.";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const prompt = `
You are an expert environmental journalist writing for "Environment Warrior" — India's top environmental platform.

Today is ${today}.

NEWS CONTEXT:
${newsContext}

RECENTLY PUBLISHED ARTICLES ON THIS SITE (do not repeat these topics, angles, or similar titles):
${recentTitlesBlock}

Write a professional 1200-1500 word environmental blog article about the most important topic from the news context above.

UNIQUENESS REQUIREMENTS (critical — read the recent titles list above carefully before writing):
- Do NOT reuse overused phrasing patterns such as "silent killer", "climate inferno", "silent scourge", "ticking time bomb", "silent emergency", "on the brink" — pick fresh, specific, non-generic language instead
- Do NOT restate a broad topic generically (e.g. not "India's water crisis" as a whole) — instead pick ONE specific, narrow angle: a particular region/state, a specific policy or scheme, a named technology, a specific community or stakeholder story, or a specific recent data point/event
- If a similar topic already appears in the recently published list above, either choose a different story from the news context entirely, or take a clearly distinct angle (different geography, different affected group, different time frame, different cause-effect chain, different proposed solution)
- Include at least 2 concrete, specific details — a named place, a specific statistic, a named policy/scheme, or a named organization — rather than vague generalities
- Vary structure and opening style between articles: sometimes open with a specific incident or anecdote, sometimes with a surprising statistic, sometimes with a stakeholder's direct situation — avoid defaulting to the same "intro paragraph → problem → solution → conclusion" template every time
- Title must be substantively different in wording and framing from every title in the recent list above, not just a synonym swap

CRITICAL: Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Start with { and end with }.

{
  "title": "50-65 character SEO title — must be clearly distinct from the recent titles listed above",
  "subtitle": "80-120 character subtitle",
  "excerpt": "150-160 character meta description",
  "content": "Full 2000 word markdown article with ## headings",
  "category": "Climate Change",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "difficulty": "Intermediate",
  "coverImagePrompt": "15-20 word National Geographic style photo description"
}

IMPORTANT JSON RULES:
- No newlines inside string values — use \\n instead
- No unescaped quotes inside strings
- No trailing commas
- Content must be valid JSON string
- Escape all special characters properly
`;

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Attempt ${attempts}/${maxAttempts}...`);

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const startIndex = text.indexOf("{");
      const endIndex = text.lastIndexOf("}");

      if (startIndex === -1 || endIndex === -1) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = text.substring(startIndex, endIndex + 1);
      const blog = JSON.parse(jsonStr);

      if (!blog.title || !blog.content || !blog.excerpt) {
        throw new Error("Missing required fields");
      }

      // NEW: soft guard — reject and retry if title is near-identical to a recent one
      const titleLower = blog.title.toLowerCase();
      const isDuplicateTitle = recentTitles.some((t) => {
        const existing = t.toLowerCase();
        // crude similarity check: shared 4+ word overlap
        const wordsA = new Set(titleLower.split(/\s+/));
        const wordsB = new Set(existing.split(/\s+/));
        const overlap = [...wordsA].filter((w) => wordsB.has(w)).length;
        return overlap >= 4;
      });

      if (isDuplicateTitle && attempts < maxAttempts) {
        console.warn(
          `⚠️ Title too similar to a recent post ("${blog.title}"), regenerating...`,
        );
        continue;
      }

      console.log(`✅ Blog: "${blog.title}"`);
      return blog;
    } catch (err) {
      console.error(`❌ Attempt ${attempts} failed: ${err.message}`);
      if (attempts === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Set this to a permanent, already-hosted cover image (e.g. one you upload once
// to Cloudinary yourself). Used only if both AI generation and Unsplash fail.
const DEFAULT_FALLBACK_IMAGE_URL =
  process.env.FALLBACK_IMAGE_URL ||
  "https://res.cloudinary.com/REPLACE_ME/image/upload/environment-warrior-default-cover.jpg";

async function generateMultipleImages(blog) {
  console.log("🖼️ Generating multiple images...");

  const featuredPrompt = blog.coverImagePrompt;
  const galleryPrompts = [
    `${blog.tags[0]} environmental impact India aerial view photography`,
    `${blog.tags[1]} community action people working together outdoors`,
    `${blog.tags[2]} nature wildlife ecosystem close up macro photography`,
  ];

  const keywords = [blog.tags[0], blog.tags[1], blog.tags[2], blog.tags[3]].map(
    (t) => t || "environment India",
  );

  const allPrompts = [featuredPrompt, ...galleryPrompts];

  const images = allPrompts.map((prompt, i) => {
    const encoded = encodeURIComponent(
      `${prompt}, professional photography, 4k, high quality, realistic`,
    );
    // pollinations.ai requires seed <= 2147483647 (signed 32-bit int).
    // Date.now() alone is a 13-digit ms timestamp and exceeds this, so we
    // fold it down into range instead of using it raw.
    const seed = (Date.now() + i * 1000) % 2147483647;
    return {
      primaryUrl: `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nolog=true&seed=${seed}`,
      keyword: keywords[i],
    };
  });

  console.log(`✅ ${images.length} image prompts generated`);
  return images;
}

async function uploadOneToCloudinary(url, index, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: "environment-warrior/auto-generated",
        // Instagram accepts JPEG images between 4:5 and 1.91:1. Creating a
        // square JPEG here gives every carousel slide the same, safe format.
        format: "jpg",
        transformation: [
          {
            width: 1080,
            height: 1080,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
          },
        ],
        timeout: 60000,
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        originalName: `ai-generated-${index + 1}.jpg`,
      };
    } catch (err) {
      console.error(
        `  ❌ Image ${index + 1} attempt ${attempt}/${maxRetries} failed: ${err.message}`,
      );
      if (attempt === maxRetries) return null;
      // pollinations.ai is a free, unauthenticated endpoint — back off and retry
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return null;
}

async function uploadWithFallback(image, index) {
  // Tier 1: AI-generated image via pollinations.ai (retried)
  let result = await uploadOneToCloudinary(image.primaryUrl, index);
  if (result) return result;

  // Tier 2: Unsplash's free source API, keyed off the blog's own tags
  console.warn(`  ⚠️ Image ${index + 1}: falling back to Unsplash (keyword: "${image.keyword}")`);
  const unsplashUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(image.keyword)}`;
  result = await uploadOneToCloudinary(unsplashUrl, index, 2);
  if (result) return result;

  // Tier 3: static default cover — always resolves, guarantees every blog has an image
  console.warn(`  ⚠️ Image ${index + 1}: falling back to static default cover image`);
  return {
    url: DEFAULT_FALLBACK_IMAGE_URL,
    publicId: null,
    resourceType: "image",
    format: "jpg",
    originalName: `default-fallback-${index + 1}.jpg`,
  };
}

async function uploadAllToCloudinary(images) {
  console.log("☁️ Uploading all images to Cloudinary...");

  const uploaded = [];

  for (let i = 0; i < images.length; i++) {
    console.log(`  Uploading image ${i + 1}/${images.length}...`);
    const result = await uploadWithFallback(images[i], i);
    uploaded.push(result);
    console.log(`  ✅ Image ${i + 1} resolved`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`✅ ${uploaded.length}/${images.length} images resolved`);
  return uploaded;
}

async function publishBlog(blogData, featuredImage, galleryImages) {
  console.log("🚀 Publishing blog...");
  const categoryId = await fetchOrCreateCategory(blogData.category);

  const payload = {
    title: blogData.title,
    subtitle: blogData.subtitle,
    excerpt: blogData.excerpt,
    content: blogData.content,
    category: categoryId,
    tags: blogData.tags,
    difficulty: blogData.difficulty,
    featuredImage: featuredImage,
    galleryImages: galleryImages,
    status: "published",
  };

  const res = await axios.post(`${BLOG_API_URL}/api/blogs`, payload, {
    headers: {
      Authorization: `Bearer ${BLOG_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`✅ Published! Slug: ${res.data.slug}`);
  return res.data;
}

// ✅ Main — Instagram integration sahi jagah pe
async function main() {
  console.log("🌍 Environment Warrior — Auto Blog Generator");
  console.log("==========================================");

  try {
    const recentTitles = await fetchRecentBlogTitles(30);
    const articles = await fetchEnvironmentNews(recentTitles);
    const blogData = await generateBlog(articles, recentTitles);
    const imageUrls = await generateMultipleImages(blogData);
    const uploadedImages = await uploadAllToCloudinary(imageUrls);

    // Defensive check only — uploadAllToCloudinary's fallback chain means this
    // should never actually be empty, but we don't crash if it somehow is.
    if (uploadedImages.length === 0) {
      console.warn(
        "⚠️ No images resolved at all — publishing blog without images and skipping Instagram post.",
      );
    }

    const featuredImage = uploadedImages[0] || null;
    const galleryImages = uploadedImages.slice(1);
    const published = await publishBlog(blogData, featuredImage, galleryImages);

    if (!featuredImage) {
      console.log("");
      console.log("🎉 SUCCESS (blog only — no images, Instagram post skipped)");
      console.log("===========");
      console.log(`📝 Title: ${published.title}`);
      console.log(
        `🔗 URL:   https://environmentwarrior.in/blog/${published.slug}`,
      );
      return;
    }

    // ✅ Instagram post — main() ke andar, publishBlog ke baad
    // (postToInstagram, buildCaption already imported at top of file)

    // main() mein:
    const blogUrl = `https://environmentwarrior.in/blog/${published.slug}`;

    // ✅ SEO optimized caption
    const caption = buildCaption(
      published.title,
      published.excerpt,
      blogUrl,
      published.tags || [],
    );

    // ✅ Alt text for SEO
    const altText = `${published.title} - Environment Warrior India`;

    await postToInstagram(
      featuredImage.url, // Featured image
      caption, // Caption
      altText, // Alt text
      galleryImages, // Gallery images array
    );
    console.log("✅ Instagram post done!");
    console.log("");
    console.log("🎉 SUCCESS!");
    console.log("===========");
    console.log(`📝 Title:    ${published.title}`);
    console.log(`🖼️ Featured: ${featuredImage.url}`);
    console.log(`🎨 Gallery:  ${galleryImages.length} images`);
    console.log(
      `🔗 URL:      https://environmentwarrior.in/blog/${published.slug}`,
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.response?.data) {
      console.error("API:", JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();