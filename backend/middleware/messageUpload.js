import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const UPLOAD_DIR = "uploads/messages/";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_ATTACHMENT_SIZE_MB = Number(process.env.MAX_ATTACHMENT_SIZE_MB) || 25;

const ALLOWED_MIMETYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : "";
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("File type not allowed"));
};

export const inferMessageType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "file";
};

const messageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_ATTACHMENT_SIZE_MB * 1024 * 1024 },
});

export default messageUpload;
