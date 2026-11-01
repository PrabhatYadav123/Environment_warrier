import express from "express";
import { chat, indexStatus, reindex } from "../controllers/chatController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { chatLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/", chatLimiter, chat);
router.get("/index", protect, adminOnly, indexStatus);
router.post("/index", protect, adminOnly, reindex);

export default router;
