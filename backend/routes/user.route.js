import { Router } from "express";
import path from "path";
import crypto from "crypto";
import {
  fetchAll,
  logout,
  signup,
  login,
  updateProfile,
  changePassword,
  checkCredentials,
  verifyOtp,
  resetPassword,
  deactivateAccount,
  getCurrentUser,
} from "../controllers/users.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import multer from "multer";

const router = Router();

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_IMAGE_MIMETYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext) ? ext : "";
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only image uploads (jpeg, png, gif, webp) are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Auth Routes
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/logout", logout);
router.put("/deactivate", isAuthenticated, deactivateAccount);

// User Routes
router.get("/me", isAuthenticated, getCurrentUser);
router.get("/", isAuthenticated, fetchAll);
router.put("/update-profile/:id", isAuthenticated, upload.single("profileImage"), updateProfile);
router.put("/change-password/:id", isAuthenticated, changePassword);

// Password Reset Routes
router.post("/check-credentials", checkCredentials);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
