import mongoose from "mongoose";

const blogChunkSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    embeddingModel: { type: String, required: true },
    blogTitle: { type: String, required: true },
    blogSlug: { type: String, required: true },
    categoryName: { type: String, default: "" },
    excerpt: { type: String, default: "" }
  },
  { timestamps: true }
);

blogChunkSchema.index({ blogId:  1, chunkIndex: 1 }, { unique: true });
blogChunkSchema.index({ blogSlug: 1 });

export default mongoose.model("BlogChunk", blogChunkSchema);
