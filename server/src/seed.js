import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import Blog from "./models/Blog.js";
import Category from "./models/Category.js";
import User from "./models/User.js";

dotenv.config();
await connectDb();

let admin = await User.findOne({ role: "admin" });
if (!admin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  admin = await User.create({
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin"
  });
}

const categories = await Category.insertMany(
  [
    { name: "Water Conservation", description: "Stories and guides about saving water." },
    { name: "Clean Energy", description: "Solar, wind and community energy projects." },
    { name: "Waste Reduction", description: "Recycling, composting and plastic-free work." }
  ],
  { ordered: false }
).catch(async () => Category.find());

const existingBlogs = await Blog.countDocuments();
if (existingBlogs === 0 && admin) {
  await Blog.create([
    {
      title: "Simple Ways to Save Water at Home",
      subtitle: "Small habits that scale into meaningful change.",
      excerpt: "Start with taps, gardens, laundry and mindful reuse.",
      content:
        "<p>Water conservation starts with daily decisions. Fix leaks, reuse greywater where safe, install low-flow fixtures and choose native plants.</p><blockquote>Every saved drop keeps a future option open.</blockquote>",
      author: admin._id,
      category: categories[0]._id,
      tags: ["water", "home", "conservation"],
      status: "published"
    },
    {
      title: "Community Clean-Up Planning Checklist",
      subtitle: "A practical guide for local teams.",
      excerpt: "Pick a site, gather volunteers, coordinate safety and measure impact.",
      content:
        "<p>A clean-up works best when roles are clear. Plan collection points, gloves, bags, hydration, first aid and post-event reporting.</p>",
      author: admin._id,
      category: categories[2]._id,
      tags: ["community", "waste", "volunteers"],
      status: "published"
    }
  ]);
}

if (!admin) {
  console.warn("Seed finished without an admin user. Set ADMIN_EMAIL and ADMIN_PASSWORD once, then run npm run seed again.");
}

console.log("Seed completed");
process.exit(0);
