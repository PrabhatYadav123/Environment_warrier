import mongoose from "mongoose";
import slugify from "slugify";

const mediaSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    resourceType: String,
    format: String,
    originalName: String
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    subtitle: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featuredImage: mediaSchema,
    galleryImages: [mediaSchema],
    video: mediaSchema,
    audio: mediaSchema,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 }
  },
  { timestamps: true }
);

blogSchema.pre("validate", function createSlugAndReadingTime(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  const words = this.content?.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean) ?? [];
  this.readingTime = Math.max(1, Math.ceil(words.length / 200));
  next();
});

export default mongoose.model("Blog", blogSchema);
