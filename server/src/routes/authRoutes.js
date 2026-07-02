import express from "express";
import { getProfile, login, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

export default router;
