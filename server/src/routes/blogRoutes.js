import express from "express";
import {
  analytics,
  createBlog,
  deleteBlog,
  getBlog,
  getBlogById,
  likeBlog,
  listBlogs,
  updateBlog
} from "../controllers/blogController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
const blogUpload = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 8 },
  { name: "video", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]);

router.get("/", listBlogs);
router.get("/analytics/summary", protect, adminOnly, analytics);
router.get("/id/:id", protect, adminOnly, getBlogById);
router.get("/:slug", getBlog);
router.post("/", protect, adminOnly, blogUpload, createBlog);
router.put("/:id", protect, adminOnly, blogUpload, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);
router.post("/:id/like", likeBlog);

export default router;
