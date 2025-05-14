import { Router } from "express";
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
} from "../controllers/users.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Auth Routes
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/logout", logout);

// User Routes
router.get("/", isAuthenticated, fetchAll);
router.put("/update-profile/:id", isAuthenticated, upload.single("profileImage"), updateProfile);
router.put("/change-password/:id", isAuthenticated, changePassword);

// Password Reset Routes
router.post("/check-credentials", checkCredentials);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
