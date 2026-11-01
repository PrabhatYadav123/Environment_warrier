import asyncHandler from "express-async-handler";
import { answerFromBlogs, getIndexStats, indexMissingPublishedBlogs, retrieveBlogs } from "../services/rag.js";

export const chat = asyncHandler(async (req, res) => {
  const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
  if (!question || question.length > 1000) {
    res.status(400);
    throw new Error("Enter a question of up to 1,000 characters.");
  }

  try {
    const matches = await retrieveBlogs(question);
    const answer = await answerFromBlogs(question, matches);
    res.json({
      answer,
      sources: matches.map(({ blogTitle, blogSlug, excerpt, score }) => ({
        title: blogTitle,
        slug: blogSlug,
        excerpt,
        relevance: Math.round(score * 100)
      }))
    });
  } catch (error) {
    console.error(`Blog chat is temporarily unavailable: ${error.message}`);
    res.status(503).json({
      code: "CHAT_TEMPORARILY_UNAVAILABLE",
      message: "Our blog assistant is temporarily unavailable. Please try again later."
    });
  }
});

export const reindex = asyncHandler(async (_req, res) => {
  res.json(await indexMissingPublishedBlogs());
});

export const indexStatus = asyncHandler(async (_req, res) => {
  res.json(await getIndexStats());
});
