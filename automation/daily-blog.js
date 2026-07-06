require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v2: cloudinary } = require("cloudinary");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BLOG_API_URL = process.env.BLOG_API_URL;
const BLOG_API_TOKEN = process.env.BLOG_API_TOKEN;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Category fetch or create
async function fetchOrCreateCategory(categoryName) {
  const res = await axios.get(`${BLOG_API_URL}/api/categories`);
  const match = res.data.find(
    (c) => c.name?.toLowerCase() === categoryName.toLowerCase()
  );
  if (match) return match._id;

  const created = await axios.post(
    `${BLOG_API_URL}/api/categories`,
    { name: categoryName },
    { headers: { Authorization: `Bearer ${BLOG_API_TOKEN}` } }
  );
  return created.data._id;
}

// ✅ Step 1: News fetch
async function fetchEnvironmentNews() {
  console.log("📰 Fetching environment news...");

  // Random topics rotate karo — variety ke liye
  const topics = [
    "climate change India 2026",
    "air pollution health impact India",
    "renewable energy solar India",
    "deforestation wildlife India",
    "water crisis India 2026",
    "plastic pollution ocean India",
    "flood drought India climate",
    "electric vehicles India green",
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  console.log(`Topic: ${randomTopic}`);

  const res = await axios.get("https://gnews.io/api/v4/search", {
    params: {
      q: randomTopic,
      lang: "en",
      max: 7,
      apikey: GNEWS_API_KEY,
    },
  });

  console.log(`Found ${res.data.articles.length} articles`);
  return res.data.articles;
}

// ✅ Step 2: Blog generate
async function generateBlog(articles) {
  console.log("✍️ Generating blog with Gemini...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  });

  const newsContext = articles
    .map((a, i) => `${i + 1}. Title: ${a.title}\n   Description: ${a.description}\n   Source: ${a.source?.name || "Unknown"}`)
    .join("\n\n");

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  const prompt = `
You are an award-winning environmental journalist writing for "Environment Warrior" — India's leading environmental awareness platform.

Today is ${today}. Here are the latest news articles:

${newsContext}

TASK: Select the SINGLE most impactful environmental story and write a world-class long-form blog article.

═══════════════════════════════════════
CONTENT REQUIREMENTS
═══════════════════════════════════════

LENGTH: 2000-2500 words
TONE: Authoritative yet accessible — like BBC Environment + National Geographic combined
STYLE: Human, emotional, fact-based, storytelling
AUDIENCE: Educated Indians who care about environment
UNIQUE ANGLE: Always connect global issues to India specifically

QUALITY CHECKLIST:
✅ Original insights — not just rephrasing the news
✅ Real statistics only — no hallucinated numbers
✅ Strong narrative arc — beginning, middle, end
✅ Local Indian context wherever possible
✅ Actionable takeaways for Indian readers
✅ Natural keyword integration — not forced
✅ Active voice throughout
✅ Short paragraphs — 2-4 lines max
✅ Smooth transitions between sections
✅ No repetition of sentences or ideas

═══════════════════════════════════════
SEO REQUIREMENTS
═══════════════════════════════════════

TITLE: 50-65 characters, emotional, curiosity-driving
SUBTITLE: 80-120 characters, expands on title
EXCERPT: 150-160 characters, meta description quality
TAGS: 5 specific long-tail SEO keywords

═══════════════════════════════════════
STRUCTURE (use these exact H2 headings)
═══════════════════════════════════════

## The Crisis No One Is Talking About
## What Is Actually Happening
## Why This Matters for India
## The Science Behind It
## The Human Cost
## Economic Consequences
## Global Response
## What India Must Do
## How You Can Make a Difference
## The Road Ahead

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Return ONLY valid JSON. No markdown fences. No explanation. No extra text.

{
  "title": "",
  "subtitle": "",
  "excerpt": "",
  "content": "",
  "category": "",
  "tags": ["", "", "", "", ""],
  "difficulty": "Intermediate",
  "coverImagePrompt": ""
}

FIELD RULES:
- title: 50-65 chars, SEO optimized, emotional hook
- subtitle: 80-120 chars, supports the title
- excerpt: 150-160 chars EXACTLY, no more
- content: 2000-2500 words, markdown, all 10 sections filled
- category: ONE of these only: Climate Change, Air Pollution, Water Crisis, Deforestation, Renewable Energy, Wildlife, Ocean Conservation, Sustainable Living
- tags: exactly 5 lowercase strings, long-tail SEO keywords
- difficulty: Beginner OR Intermediate OR Advanced
- coverImagePrompt: 15-20 words, National Geographic style photo description
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // JSON clean karo
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid JSON from Gemini");

  // Clean control characters
  const cleanJson = jsonMatch[0]
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\n/g, "\\n");

  const blog = JSON.parse(cleanJson);
  console.log(`✅ Blog: "${blog.title}"`);
  console.log(`   Words: ~${blog.content.split(" ").length}`);
  return blog;
}

// ✅ Step 3: Multiple images generate karo
async function generateMultipleImages(blog) {
  console.log("🖼️ Generating multiple images...");

  // Featured image ke liye main prompt
  const featuredPrompt = blog.coverImagePrompt;

  // Gallery ke liye alag alag prompts
  const galleryPrompts = [
    `${blog.tags[0]} environmental impact India aerial view photography`,
    `${blog.tags[1]} community action people working together outdoors`,
    `${blog.tags[2]} nature wildlife ecosystem close up macro photography`,
  ];

  const allPrompts = [featuredPrompt, ...galleryPrompts];

  const imageUrls = allPrompts.map((prompt, i) => {
    const encoded = encodeURIComponent(
      `${prompt}, professional photography, 4k, high quality, realistic`
    );
    // Alag seed se alag image milegi
    return `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nolog=true&seed=${Date.now() + i * 1000}`;
  });

  console.log(`✅ ${imageUrls.length} image URLs generated`);
  return imageUrls;
}

// ✅ Step 4: Upload all images to Cloudinary
async function uploadAllToCloudinary(imageUrls) {
  console.log("☁️ Uploading all images to Cloudinary...");

  const uploaded = [];

  for (let i = 0; i < imageUrls.length; i++) {
    console.log(`  Uploading image ${i + 1}/${imageUrls.length}...`);
    try {
      const result = await cloudinary.uploader.upload(imageUrls[i], {
        folder: "environment-warrior/auto-generated",
        timeout: 60000,
      });
      uploaded.push({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        originalName: `ai-generated-${i + 1}.jpg`,
      });
      console.log(`  ✅ Image ${i + 1} uploaded`);

      // Rate limit avoid karne ke liye
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`  ❌ Image ${i + 1} failed: ${err.message}`)
    }
  }

  console.log(`✅ ${uploaded.length} images uploaded to Cloudinary`)
  return uploaded
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
    featuredImage: featuredImage,         // ← Pehli image
    galleryImages: galleryImages,          // ← Baaki 3 images
    status: "published",
  };

  const res = await axios.post(
    `${BLOG_API_URL}/api/blogs`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${BLOG_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(`✅ Published! Slug: ${res.data.slug}`);
  return res.data;
}

// ✅ Main
async function main() {
  console.log("🌍 Environment Warrior — Auto Blog Generator");
  console.log("==========================================");

  try {
    const articles = await fetchEnvironmentNews();
    const blogData = await generateBlog(articles);

    // Multiple images generate karo
    const imageUrls = await generateMultipleImages(blogData);

    // Sab Cloudinary pe upload karo
    const uploadedImages = await uploadAllToCloudinary(imageUrls);

    // Pehli = featured, baaki = gallery
    const featuredImage = uploadedImages[0];
    const galleryImages = uploadedImages.slice(1); // [1, 2, 3]

    const published = await publishBlog(blogData, featuredImage, galleryImages);

    console.log("");
    console.log("🎉 SUCCESS!");
    console.log("===========");
    console.log(`📝 Title:    ${published.title}`);
    console.log(`🖼️ Featured: ${featuredImage.url}`);
    console.log(`🎨 Gallery:  ${galleryImages.length} images`);
    console.log(`🔗 URL:      ${BLOG_API_URL}/blog/${published.slug}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.response?.data) {
      console.error("API:", JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();