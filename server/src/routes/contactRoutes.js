import express from "express";
import {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact
} from "../controllers/contactController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { contactLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/", contactLimiter, submitContact)               // Public
router.get("/", protect, adminOnly, getContacts)            // Admin only
router.put("/:id/read", protect, adminOnly, markAsRead)     // Admin only
router.delete("/:id", protect, adminOnly, deleteContact)    // Admin only

export default router;
