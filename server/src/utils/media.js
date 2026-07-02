import { cloudinary, isCloudinaryReady } from "../config/cloudinary.js";

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
  const localUrl = file.destination
    ? `${process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${file.filename}`
    : undefined;

  return {
    url: uploaded?.secure_url || localUrl || file.path,
    publicId: uploaded?.public_id || file.filename,
    resourceType: file.mimetype?.split("/")[0],
    format: uploaded?.format || file.mimetype?.split("/")[1],
    originalName: file.originalname
  };
}
