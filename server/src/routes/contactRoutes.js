import express from "express";
import {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact
} from "../controllers/contactController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", submitContact)                              // Public
router.get("/", protect, adminOnly, getContacts)            // Admin only
router.put("/:id/read", protect, adminOnly, markAsRead)     // Admin only
router.delete("/:id", protect, adminOnly, deleteContact)    // Admin only

export default router;