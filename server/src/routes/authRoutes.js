import express from "express";
import {
  createUser,
  deleteUser,
  getProfile,
  listUsers,
  login,
  updateProfile,
  updateUser
} from "../controllers/authController.js";
import { protect, superAdminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.get("/users", protect, superAdminOnly, listUsers);
router.post("/users", protect, superAdminOnly, createUser);
router.put("/users/:id", protect, superAdminOnly, updateUser);
router.delete("/users/:id", protect, superAdminOnly, deleteUser);

export default router;
