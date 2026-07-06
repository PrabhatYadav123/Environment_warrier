require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require("form-data");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BLOG_API_URL = process.env.BLOG_API_URL;
const BLOG_API_TOKEN = process.env.BLOG_API_TOKEN;

const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Step 1 ke upar ye function add karo
async function fetchOrCreateCategory(categoryName) {
  // Sabhi categories fetch karo
  const res = await axios.get(`${BLOG_API_URL}/api/categories`);
  const categories = res.data;

  // Match dhundo
  const match = categories.find(
    (c) => c.name?.toLowerCase() === categoryName.toLowerCase(),
  );

  if (match) {
    console.log(`Category found: ${match.name} (${match._id})`);
    return match._id;
  }

  // Nahi mili toh create karo
  const created = await axios.post(
    `${BLOG_API_URL}/api/categories`,
    { name: categoryName },
    {
      headers: {
        Authorization: `Bearer ${BLOG_API_TOKEN}`,
      },
    },
  );

  console.log(`Category created: ${created.data.name}`);
  return created.data._id;
}

// Step 1: GNews se news fetch karo
async function fetchEnvironmentNews() {
  console.log("📰 Fetching environment news from GNews...");

  const res = await axios.get("https://gnews.io/api/v4/search", {
    params: {
      q: "environment OR climate change OR sustainability",
      lang: "en",
      max: 5,
      apikey: GNEWS_API_KEY,
    },
  });

  const articles = res.data.articles;
  console.log(`Found ${articles.length} articles`);
  return articles;
}

// Step 2: Gemini se blog generate karo
async function generateBlog(articles) {
  console.log("✍️ Generating blog with Gemini...");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const newsContext = articles
    .map(
      (a, i) => `${i + 1}. Title: ${a.title}\n Description: ${a.description}`,
    )
    .join("\n\n");

  const prompt = `
You are a professional environment blog writer for a website called "Environment Warrior".

Today's top news articles:
${newsContext}

Your task: Write a detailed, SEO-optimized blog post based on the most important topic from above news.

STRICT RULES:
- Return ONLY raw JSON — no markdown, no backticks, no explanation
- Content must be minimum 100 words in proper markdown
- Use ## for headings, bullet points, bold text, code blocks where needed
- excerpt must be exactly under 20 characters
- Pick category EXACTLY from this list.
- tags must be array of 4-5 lowercase strings
- difficulty must be exactly one of: Beginner, Intermediate, Advanced
- coverImagePrompt must describe a realistic nature/environment photo scene in 10-15 words

Return this exact JSON structure:
{
  "title": "Engaging SEO friendly title here",
  "excerpt": "Compelling short description under 280 chars that makes user want to read",
  "content": "## Introduction\n\nFull blog content here in markdown...\n\n## Section 2\n\ncontent...",
  "category": "exact category name from list",
  "tags": ["climate", "environment", "nature", "sustainability"],
  "difficulty": "Beginner",
  "coverImagePrompt": "lush green forest with sunlight streaming through trees cinematic"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // JSON extract karo response se
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini ne valid JSON nahi diya!");

  const blog = JSON.parse(jsonMatch[0]);
  console.log(`Blog title: ${blog.title}`);
  return blog;
}

async function publishBlog(blogData, coverImage) {
  console.log("🚀 Publishing blog to site...");


  // Category ID fetch karo pehle
  const categoryId = await fetchOrCreateCategory(blogData.category);

  const payload = {
  ...blogData,
  category: categoryId,
  featuredImage: coverImage,
  galleryImages: [coverImage],
  published: true,
};

console.log(JSON.stringify(payload, null, 2));

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
  console.log(`✅ Blog published! Slug: ${res.data.slug}`);
  return res.data;
}

async function generateCoverImage(coverImagePrompt) {
  console.log("🖼️ Generating cover image...");

  const prompt = encodeURIComponent(
    `${coverImagePrompt} high quality professional photography 4k`,
  );

  const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=630&nolog=true`;

  console.log(`✅ Image URL: ${imageUrl}`);
  return imageUrl;
}

async function uploadImageToCloudinary(imageUrl) {
  console.log("☁️ Uploading image to Cloudinary...");

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "environment-warrior",
  });

  console.log("✅ Uploaded to Cloudinary");

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    originalName: "generated-image.jpg",
  };
}

// Main function
async function main() {
  try {
    const articles = await fetchEnvironmentNews();
    const blogData = await generateBlog(articles);
   const generatedImageUrl = await generateCoverImage(
  blogData.coverImagePrompt
);

const cloudinaryImage = await uploadImageToCloudinary(
  generatedImageUrl
);

const published = await publishBlog(blogData, cloudinaryImage);

    console.log("");
    console.log("=== SUCCESS ===");
    console.log(`Title: ${published.title}`);
    console.log(`URL: ${BLOG_API_URL}/blog/${published.slug}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.response) {
      console.error("Response:", err.response.data);
    }
    process.exit(1);
  }
}

main();
