import { cloudinary, isCloudinaryReady } from "../config/cloudinary.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resourceType(mimetype = "") {
  const type = mimetype.split("/")[0];
  return type === "audio" ? "video" : type || "auto";
}

async function uploadToCloudinary(file) {
  if (!isCloudinaryReady()) return null;
  return cloudinary.uploader.upload(file.path, {
    folder: "environment-warrior",
    resource_type: resourceType(file.mimetype)
  });
}

export async function toMedia(file) {
  if (!file) return undefined;
  const uploaded = await uploadToCloudinary(file);
  const localUrl = file.destination ? `/uploads/${file.filename}` : undefined;

  return {
    url: uploaded?.secure_url || localUrl || file.path,
    publicId: uploaded?.public_id || file.filename,
    resourceType: file.mimetype?.split("/")[0],
    format: uploaded?.format || file.mimetype?.split("/")[1],
    originalName: file.originalname
  };
}

export function publicOrigin(req) {
  return process.env.SERVER_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
}

export function resolveMediaUrl(media, req) {
  if (!media?.url) return media;

  let url = media.url;
  try {
    const parsed = new URL(url);
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if (isLocalhost && parsed.pathname.startsWith("/uploads/")) {
      url = parsed.pathname;
    }
  } catch {
    // Relative URLs are expected for locally stored uploads.
  }

  if (url.startsWith("/uploads/")) {
    url = `${publicOrigin(req)}${url}`;
  }

  return { ...media, url };
}

export function resolveBlogMedia(blog, req) {
  const item = typeof blog.toObject === "function" ? blog.toObject() : blog;
  return {
    ...item,
    featuredImage: resolveMediaUrl(item.featuredImage, req),
    galleryImages: item.galleryImages?.map((image) => resolveMediaUrl(image, req)) || [],
    video: resolveMediaUrl(item.video, req),
    audio: resolveMediaUrl(item.audio, req)
  };
}

export async function destroyMedia(media) {
  if (!media) return;

  if (isCloudinaryReady() && media.publicId && !media.url?.startsWith("/uploads/")) {
    const resource_type = media.resourceType === "audio" ? "video" : media.resourceType || "image";
    await cloudinary.uploader.destroy(media.publicId, { resource_type }).catch(() => null);
    return;
  }

  const filename = media.publicId || media.url?.split("/uploads/")[1];
  if (!filename) return;

  const uploadPath = path.resolve(__dirname, "../uploads", path.basename(filename));
  await fs.unlink(uploadPath).catch(() => null);
}
