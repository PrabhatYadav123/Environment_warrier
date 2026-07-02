import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDiskStorage = multer.diskStorage({
  destination: path.resolve(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

export const upload = multer({
  storage: localDiskStorage,
  limits: { fileSize: 60 * 1024 * 1024 }
});
