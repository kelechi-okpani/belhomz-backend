import { Router } from "express";
import { authenticate, requireRole } from "../../../shared/middlewares/auth";
import { UserRole } from "../../users/interfaces/user.interface";
import {
  createLead,
  listLeads,
  getLead,
  updateLeadStage,
  reassignLead,
  addLeadActivity,
  scheduleInspection,
  rescheduleInspection,
  salesFunnel,
  topAgents,
} from "../controllers/lead.controller";

const router = Router();

router.use(authenticate);

router.get("/funnel", requireRole(UserRole.OWNER), salesFunnel);
router.get("/top-agents", requireRole(UserRole.OWNER), topAgents);

router.post("/", requireRole(UserRole.OWNER, UserRole.AGENT, UserRole.STAFF), createLead);
router.get("/", listLeads);
router.get("/:id", getLead);
router.patch("/:id/stage", requireRole(UserRole.OWNER, UserRole.AGENT, UserRole.STAFF), updateLeadStage);
router.patch("/:id/reassign", requireRole(UserRole.OWNER), reassignLead);
router.post("/:id/activities", requireRole(UserRole.OWNER, UserRole.AGENT, UserRole.STAFF), addLeadActivity);
router.post(
  "/:id/inspection",
  requireRole(UserRole.OWNER, UserRole.AGENT, UserRole.STAFF),
  scheduleInspection
);
router.patch(
  "/:id/inspection",
  requireRole(UserRole.OWNER, UserRole.AGENT, UserRole.STAFF),
  rescheduleInspection
);

export { router as leadRoutes };