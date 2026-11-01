import asyncHandler from "express-async-handler";
import { answerFromBlogs, getIndexStats, indexMissingPublishedBlogs, retrieveBlogs } from "../services/rag.js";

export const chat = asyncHandler(async (req, res) => {
  const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
  if (!question || question.length > 1000) {
    res.status(400);
    throw new Error("Enter a question of up to 1,000 characters.");
  }

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
});

export const reindex = asyncHandler(async (_req, res) => {
  res.json(await indexMissingPublishedBlogs());
});

export const indexStatus = asyncHandler(async (_req, res) => {
  res.json(await getIndexStats());
});
