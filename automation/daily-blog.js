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

  const topics = [
    "climate change India 2026",
    "air pollution India",
    "renewable energy solar India",
    "deforestation wildlife India",
    "water conservation India",
    "plastic pollution ocean",
    "flood drought India",
    "electric vehicles India",
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
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

  // ✅ Fallback — GNews fail ho toh hardcoded context use karo
  console.log("⚠️ Using fallback news context...");
  return [
    {
      title: "India's Climate Crisis: Rising Temperatures Threaten Millions",
      description: "India faces unprecedented climate challenges in 2026 with record temperatures, erratic monsoons, and increasing extreme weather events affecting agriculture and public health."
    },
    {
      title: "Air Pollution in Indian Cities Reaches Critical Levels",
      description: "Multiple Indian cities report dangerous AQI levels, prompting health advisories and calls for stricter emission controls across industrial and transport sectors."
    },
    {
      title: "Solar Energy Expansion Accelerates Across Rural India",
      description: "India's renewable energy push gains momentum as solar installations in rural areas provide clean electricity to millions previously dependent on diesel generators."
    }
  ];
}

// ✅ Step 2: Blog generate
async function generateBlog(articles) {
  console.log("✍️ Generating blog with Gemini...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
 const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
  },
});

  const newsContext = articles
    .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description}`)
    .join("\n\n");

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  const prompt = `
You are an expert environmental journalist writing for "Environment Warrior" — India's top environmental platform.

Today is ${today}.

NEWS CONTEXT:
${newsContext}

Write a professional 1200-1500 word environmental blog article about the most important topic from above.

CRITICAL: Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Start with { and end with }.

{
  "title": "50-65 character SEO title",
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

      // Clean karo
      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // JSON extract karo
      const startIndex = text.indexOf("{");
      const endIndex = text.lastIndexOf("}");

      if (startIndex === -1 || endIndex === -1) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = text.substring(startIndex, endIndex + 1);

      // Parse karo
      const blog = JSON.parse(jsonStr);

      // Validate karo
      if (!blog.title || !blog.content || !blog.excerpt) {
        throw new Error("Missing required fields");
      }

      console.log(`✅ Blog: "${blog.title}"`);
      return blog;

    } catch (err) {
      console.error(`❌ Attempt ${attempts} failed: ${err.message}`);
      if (attempts === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${err.message}`);
      }
      // Wait karke retry karo
      await new Promise(r => setTimeout(r, 3000));
    }
  }
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