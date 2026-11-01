import Blog from "../models/Blog.js";
import BlogChunk from "../models/BlogChunk.js";
import Category from "../models/Category.js";

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const GENERATION_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 180;
const EMBEDDING_REQUESTS_PER_MINUTE = 80;
const embeddingRequestTimes = [];

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function reserveEmbeddingRequests(count) {
  while (true) {
    const now = Date.now();
    while (embeddingRequestTimes.length && now - embeddingRequestTimes[0] >= 60_000) embeddingRequestTimes.shift();
    if (embeddingRequestTimes.length + count <= EMBEDDING_REQUESTS_PER_MINUTE) {
      for (let i = 0; i < count; i += 1) embeddingRequestTimes.push(Date.now());
      return;
    }
    await wait(Math.max(250, 60_050 - (now - embeddingRequestTimes[0])));
  }
}

function cleanHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoChunks(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf(" ", end);
      if (boundary > start + CHUNK_SIZE * 0.65) end = boundary;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks;
}

async function geminiRequest(model, operation, body, { embeddingCount = 0 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (embeddingCount) await reserveEmbeddingRequests(embeddingCount);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:${operation}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    const payload = await response.json().catch(() => ({}));
    if (response.ok) return payload;
    const message = payload.error?.message || `Gemini ${operation} request failed`;
    if (response.status === 429 && /per day limit exceeded/i.test(message)) {
      throw new Error(`Gemini daily embedding quota is exhausted. ${message}`);
    }
    if (response.status === 429 && attempt < 2) {
      const retryText = message.match(/retry in ([\d.]+)(s|m|h)/i);
      const retryValue = Number(retryText?.[1]);
      const retryUnit = retryText?.[2]?.toLowerCase();
      const retryMs = retryValue * (retryUnit === "h" ? 3_600_000 : retryUnit === "m" ? 60_000 : 1000);
      await wait(Number.isFinite(retryMs) && retryMs > 0 ? retryMs + 500 : 60_000);
      continue;
    }
    throw new Error(message);
  }
  throw new Error(`Gemini ${operation} request failed after retries`);
}

export async function embedText(text, taskType) {
  const result = await geminiRequest(EMBEDDING_MODEL, "embedContent", {
    content: { parts: [{ text }] },
    taskType
  }, { embeddingCount: 1 });
  const values = result.embedding?.values;
  if (!Array.isArray(values) || !values.length) throw new Error("Gemini returned an empty embedding");
  return values;
}

async function embedTexts(texts, taskType) {
  const embeddings = [];
  for (const text of texts) embeddings.push(await embedText(text, taskType));
  return embeddings;
}

export async function indexBlog(blog) {
  if (blog.status !== "published") {
    await BlogChunk.deleteMany({ blogId: blog._id });
    return { chunks: 0 };
  }

  const category = blog.category?.name
    ? blog.category
    : blog.category
      ? await Category.findById(blog.category).select("name").lean()
      : null;
  const categoryName = category?.name || "";
  const fullText = [blog.title, blog.subtitle, blog.excerpt, categoryName, ...(blog.tags || []), cleanHtml(blog.content)]
    .filter(Boolean)
    .join("\n\n");
  const chunks = splitIntoChunks(fullText);
  const docs = [];
  for (let batchStart = 0; batchStart < chunks.length; batchStart += EMBEDDING_REQUESTS_PER_MINUTE) {
    const batch = chunks.slice(batchStart, batchStart + EMBEDDING_REQUESTS_PER_MINUTE);
    const embeddings = await embedTexts(batch, "RETRIEVAL_DOCUMENT");
    batch.forEach((text, offset) => docs.push({
      blogId: blog._id,
      chunkIndex: batchStart + offset,
      text,
      embedding: embeddings[offset],
      embeddingModel: EMBEDDING_MODEL,
      blogTitle: blog.title,
      blogSlug: blog.slug,
      categoryName,
      excerpt: blog.excerpt || ""
    }));
  }

  await BlogChunk.deleteMany({ blogId: blog._id });
  if (docs.length) await BlogChunk.insertMany(docs);
  return { chunks: docs.length };
}

export async function removeBlogFromIndex(blogId) {
  await BlogChunk.deleteMany({ blogId });
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

export async function retrieveBlogs(question, limit = 5) {
  const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY");
  const chunks = await BlogChunk.find({ embeddingModel: EMBEDDING_MODEL }).lean();
  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .filter((chunk) => chunk.score > 0.25)
    .sort((a, b) => b.score - a.score);

  const bestByBlog = new Map();
  for (const chunk of ranked) {
    const previous = bestByBlog.get(String(chunk.blogId));
    if (!previous) bestByBlog.set(String(chunk.blogId), { ...chunk, matchedChunks: [chunk.text] });
    else if (previous.matchedChunks.length < 2) previous.matchedChunks.push(chunk.text);
  }
  return [...bestByBlog.values()].slice(0, limit);
}

export async function answerFromBlogs(question, matches) {
  if (!matches.length) {
    return "I couldn’t find a relevant blog in our library. Try asking about another environmental topic.";
  }

  const context = matches.map((match, index) =>
    `[${index + 1}] ${match.blogTitle}\n${match.matchedChunks.join("\n")}`
  ).join("\n\n");
  const result = await geminiRequest(GENERATION_MODEL, "generateContent", {
    systemInstruction: {
      parts: [{ text: "You are Environment Warrior's blog assistant. Answer the user's question using only the supplied blog excerpts. Be concise and clear. If the excerpts do not contain the answer, say so. Do not invent facts. Cite supporting sources inline as [1], [2] using the supplied source numbers." }]
    },
    contents: [{ role: "user", parts: [{ text: `Question: ${question}\n\nBlog excerpts:\n${context}` }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
  });
  return result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim()
    || "I couldn’t generate an answer from the matching blogs. Please try again.";
}

export async function reindexPublishedBlogs() {
  const blogs = await Blog.find({ status: "published" }).populate("category", "name").select("title subtitle excerpt content tags status slug category");
  const currentIds = blogs.map((blog) => blog._id);
  await BlogChunk.deleteMany({ blogId: { $nin: currentIds } });

  let indexed = 0;
  let failed = 0;
  const errors = [];
  for (const blog of blogs) {
    try {
      await indexBlog(blog);
      indexed += 1;
    } catch (error) {
      failed += 1;
      errors.push({ title: blog.title, message: error.message });
      if (/daily embedding quota is exhausted/i.test(error.message)) break;
    }
  }
  return { total: blogs.length, indexed, failed, errors };
}

export async function indexMissingPublishedBlogs() {
  const blogs = await Blog.find({ status: "published" }).populate("category", "name").select("title subtitle excerpt content tags status slug category");
  await BlogChunk.deleteMany({ blogId: { $nin: blogs.map((blog) => blog._id) } });
  const existingIds = new Set((await BlogChunk.distinct("blogId", { embeddingModel: EMBEDDING_MODEL })).map(String));
  const missing = blogs.filter((blog) => !existingIds.has(String(blog._id)));
  let indexed = 0;
  let failed = 0;
  const errors = [];
  for (const blog of missing) {
    try {
      await indexBlog(blog);
      indexed += 1;
    } catch (error) {
      failed += 1;
      errors.push({ title: blog.title, message: error.message });
      if (/daily embedding quota is exhausted/i.test(error.message)) break;
    }
  }
  return { total: blogs.length, alreadyIndexed: blogs.length - missing.length, indexed, failed, errors };
}

export async function getIndexStats() {
  const [blogsIndexed, chunks] = await Promise.all([
    BlogChunk.distinct("blogId", { embeddingModel: EMBEDDING_MODEL }),
    BlogChunk.countDocuments({ embeddingModel: EMBEDDING_MODEL })
  ]);
  return { blogsIndexed: blogsIndexed.length, chunks, embeddingModel: EMBEDDING_MODEL };
}
