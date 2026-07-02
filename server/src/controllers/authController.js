import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

function sendAuth(res, user) {
  res.json({
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    }
  });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  sendAuth(res, user);
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.profileImage = req.body.profileImage ?? user.profileImage;

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();
  sendAuth(res, user);
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "author" } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (!["admin", "author"].includes(role)) {
    res.status(400);
    throw new Error("Role must be admin or author");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.role && !["admin", "author"].includes(req.body.role)) {
    res.status(400);
    throw new Error("Role must be admin or author");
  }

  if (req.body.email) {
    const emailOwner = await User.findOne({ email: req.body.email });
    if (emailOwner && String(emailOwner._id) !== String(user._id)) {
      res.status(409);
      throw new Error("A user with this email already exists");
    }
  }

  if (user.role === "admin" && req.body.role && req.body.role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error("At least one admin account is required");
    }
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.role = req.body.role ?? user.role;
  if (req.body.password) user.password = req.body.password;

  await user.save();
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    res.status(400);
    throw new Error("You cannot delete your own account while logged in");
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin" && adminCount <= 1) {
    res.status(400);
    throw new Error("At least one admin account is required");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});
