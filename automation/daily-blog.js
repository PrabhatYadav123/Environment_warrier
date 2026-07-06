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
You are an award-winning environmental journalist and SEO content writer writing for "Environment Warrior".

Today's news:
${newsContext}

Select the SINGLE most important environmental story and convert it into a professional long-form article.

STRICT REQUIREMENTS

Return ONLY valid JSON.
Do NOT use markdown code fences.
Do NOT explain anything.

The article must be:

- 1800-2500 words
- 100% original
- Human-like writing
- SEO optimized
- Easy to read
- Fact based
- No hallucinated statistics
- Natural storytelling style
- Active voice
- Professional tone

Formatting rules:

- Start with an engaging introduction.
- Use H2 headings (##) only.
- Every section should have 3-5 paragraphs.
- Paragraphs should be only 2-4 lines long.
- Use bullet lists where appropriate.
- Bold important facts.
- Add transitions between sections.
- End with a strong conclusion.
- Never leave a heading empty.
- Avoid repeating the same sentence.

SEO Rules:

- Create a highly clickable title.
- Naturally repeat the main keyword throughout the article.
- Include long-tail keywords.
- Write an engaging meta description (excerpt).
- Use semantic keywords.
- Make the article suitable for Google ranking.

Return JSON in exactly this format:

{
"title":"",
"subtitle":"",
"excerpt":"",
"content":"",
"category":"",
"tags":["","","","",""],
"difficulty":"Intermediate",
"coverImagePrompt":""
}

Field rules

title
- 50-65 characters
- emotional
- SEO friendly

subtitle
- 80-120 characters

excerpt
- 150-180 characters

content
- 1800-2500 words
- Markdown
- Structure:

## Introduction

## Why this matters

## What happened

## Scientific explanation

## Environmental impact

## Economic impact

## Global perspective

## Solutions

## What governments can do

## What individuals can do

## Key Takeaways

## Conclusion

tags
Exactly 5 lowercase SEO tags.

difficulty
Beginner, Intermediate or Advanced.

coverImagePrompt
15-20 words describing a realistic National Geographic style environmental photograph.
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
  published: "published",
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
