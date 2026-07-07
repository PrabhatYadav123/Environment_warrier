import asyncHandler from "express-async-handler";
import slugify from "slugify";
import Blog from "../models/Blog.js";
import { destroyMedia, resolveBlogMedia, toMedia } from "../utils/media.js";

const populate = [
  { path: "author", select: "name profileImage" },
  { path: "category", select: "name slug" }
];

function buildQuery(req, includeDrafts = false) {
  const query = includeDrafts ? {} : { status: "published" };

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { subtitle: { $regex: req.query.search, $options: "i" } },
      { excerpt: { $regex: req.query.search, $options: "i" } },
      { tags: { $regex: req.query.search, $options: "i" } }
    ];
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.status && includeDrafts) {
    query.status = req.query.status;
  }

  return query;
}

async function getBlogPayload(req) {
  const files = req.files || {};
  const tags = typeof req.body.tags === "string"
    ? req.body.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : req.body.tags;

  const payload = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    excerpt: req.body.excerpt,
    content: req.body.content,
    category: req.body.category || undefined,
    tags,
    status: req.body.status
  };

  if (req.body.title) {
    payload.slug = slugify(req.body.title, { lower: true, strict: true });
  }
 // Featured Image
if (files.featuredImage?.[0]) {
  payload.featuredImage = await toMedia(files.featuredImage[0]);
} else if (req.body.featuredImage) {
  payload.featuredImage =
    typeof req.body.featuredImage === "string"
      ? JSON.parse(req.body.featuredImage)
      : req.body.featuredImage;
}

// Gallery Images
if (files.galleryImages?.length) {
  payload.galleryImages = await Promise.all(
    files.galleryImages.map(toMedia)
  );
} else if (req.body.galleryImages) {
  payload.galleryImages =
    typeof req.body.galleryImages === "string"
      ? JSON.parse(req.body.galleryImages)
      : req.body.galleryImages;
}

// Video
if (files.video?.[0]) {
  payload.video = await toMedia(files.video[0]);
} else if (req.body.video) {
  payload.video =
    typeof req.body.video === "string"
      ? JSON.parse(req.body.video)
      : req.body.video;
}

// Audio
if (files.audio?.[0]) {
  payload.audio = await toMedia(files.audio[0]);
} else if (req.body.audio) {
  payload.audio =
    typeof req.body.audio === "string"
      ? JSON.parse(req.body.audio)
      : req.body.audio;
}

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  return payload;
}

function isTrue(value) {
  return value === true || value === "true";
}

function parseKeepGalleryImages(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export const listBlogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;
  const query = buildQuery(req, req.query.includeDrafts === "true");

  const [items, total] = await Promise.all([
    Blog.find(query)
      .populate(populate)
      .sort(req.query.sort === "trending" ? { views: -1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Blog.countDocuments(query)
  ]);

  res.json({ items: items.map((blog) => resolveBlogMedia(blog, req)), total, page, pages: Math.ceil(total / limit) });
});


export const addView = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  res.json({
    success: true,
    views: blog.views,
  });
});

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate(populate);
  if (!blog || (blog.status !== "published" && !req.user)) {
    res.status(404);
    throw new Error("Blog not found");
  }


  res.json(resolveBlogMedia(blog, req));
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(populate);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  res.json(resolveBlogMedia(blog, req));
});

export const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...(await getBlogPayload(req)),
    author: req.user._id
  });
  res.status(201).json(resolveBlogMedia(await blog.populate(populate), req));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const payload = await getBlogPayload(req);
  const singleMediaFields = ["featuredImage", "video", "audio"];

  for (const field of singleMediaFields) {
    if (payload[field] || isTrue(req.body[`remove${field[0].toUpperCase()}${field.slice(1)}`])) {
      await destroyMedia(blog[field]);
    }
  }

  if (isTrue(req.body.removeFeaturedImage)) payload.featuredImage = undefined;
  if (isTrue(req.body.removeVideo)) payload.video = undefined;
  if (isTrue(req.body.removeAudio)) payload.audio = undefined;

  const keepGalleryImages = parseKeepGalleryImages(req.body.keepGalleryImages);
  if (keepGalleryImages) {
    const keepKeys = new Set(keepGalleryImages.map((image) => image.publicId || image.url).filter(Boolean));
    const existingGallery = blog.galleryImages || [];
    const keptGallery = existingGallery.filter((image) => keepKeys.has(image.publicId || image.url));
    const removedGallery = existingGallery.filter((image) => !keepKeys.has(image.publicId || image.url));

    await Promise.all(removedGallery.map(destroyMedia));
    payload.galleryImages = [...keptGallery, ...(payload.galleryImages || [])];
  }

  Object.assign(blog, payload);
  await blog.save();
  res.json(resolveBlogMedia(await blog.populate(populate), req));
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  await Promise.all([
    destroyMedia(blog.featuredImage),
    ...(blog.galleryImages || []).map(destroyMedia),
    destroyMedia(blog.video),
    destroyMedia(blog.audio)
  ]);

  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
});

export const likeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  blog.likes += 1;
  await blog.save();
  res.json({ likes: blog.likes });
});

export const analytics = asyncHandler(async (_req, res) => {
  const [totalBlogs, publishedBlogs, draftBlogs, viewsAgg] = await Promise.all([
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "draft" }),
    Blog.aggregate([{ $group: { _id: null, views: { $sum: "$views" }, likes: { $sum: "$likes" } } }])
  ]);

  res.json({
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalViews: viewsAgg[0]?.views ?? 0,
    totalLikes: viewsAgg[0]?.likes ?? 0
  });
});
