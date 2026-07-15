import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../../../shared/middlewares/auth";
import { UserRole } from "../../users/interfaces/user.interface";
// import { uploadPropertyImage, deletePropertyImage } from "../controllers/property.controller";
import { deletePropertyImage } from "../controllers/property.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const router = Router();

router.delete(
  "/:id/images/:publicId",
  authenticate,
  requireRole(UserRole.OWNER),
  deletePropertyImage
);

export { router as propertyRoutes };
