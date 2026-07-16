import { Router } from "express";
import { authenticate, requireRole } from "../../../shared/middlewares/auth";
import { UserRole } from "../../users/interfaces/user.interface";
import {
  createPayment,
  listPayments,
  getPayment,
  recordInstallmentPayment,
  pendingPayments,
  overduePayments,
  monthlyRevenue,
} from "../controllers/payment.controller";

const router = Router();

router.use(authenticate, requireRole(UserRole.OWNER));

router.get("/pending", pendingPayments);
router.get("/overdue", overduePayments);
router.get("/revenue/monthly", monthlyRevenue);

router.post("/", createPayment);
router.get("/", listPayments);
router.get("/:id", getPayment);
router.post("/:paymentId/installments/:installmentId/pay", recordInstallmentPayment);

export { router as paymentRoutes };
