import { Router } from "express";
import { authenticate, requireRole } from "../../../shared/middlewares/auth";
import { UserRole } from "../interfaces/user.interface";
import {
  listStaff,
  getUser,
  getMe,
  updateProfile,
  changeUserRole,
  deactivateUser,
  reactivateUser,
} from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", updateProfile);

router.get("/", requireRole(UserRole.OWNER), listStaff);
router.get("/:id", requireRole(UserRole.OWNER), getUser);
router.patch("/:id/role", requireRole(UserRole.OWNER), changeUserRole);
router.patch("/:id/deactivate", requireRole(UserRole.OWNER), deactivateUser);
router.patch("/:id/reactivate", requireRole(UserRole.OWNER), reactivateUser);

export { router as userRoutes };
