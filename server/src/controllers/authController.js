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
