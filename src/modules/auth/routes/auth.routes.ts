import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth";
import { authLimiter } from "../../../shared/middlewares/rateLimiter";
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authenticate, logout);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export { router as authRoutes };