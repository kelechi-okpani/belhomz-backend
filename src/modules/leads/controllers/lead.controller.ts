import { Request, Response } from "express";
import { catchAsync } from "../../../shared/utils/catchAsync";
import { sendSuccess } from "../../../shared/utils/ApiResponse";
import { ApiError } from "../../../shared/utils/ApiError";
import { leadService } from "../services/lead.service";
import { UserRole } from "../../users/interfaces/user.interface";
import {
  createLeadSchema,
  updateStageSchema,
  addActivitySchema,
  scheduleInspectionSchema,
  rescheduleInspectionSchema,
} from "../validators/lead.validator";

export const createLead = catchAsync(async (req: Request | any, res: Response) => {
  const input = createLeadSchema.parse(req.body);
  const lead = await leadService.create(input);
  return sendSuccess(res, 201, lead, "Lead created successfully");
});

export const listLeads = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const filter: { assignedAgent?: string; stage?: string } = {
    stage: req.query.stage as string | undefined,
    assignedAgent: req.query.assignedAgent as string | undefined,
  };

  if (req.user.role === UserRole.AGENT) filter.assignedAgent = req.user.id;

  const leads = await leadService.list(filter as any);
  return sendSuccess(res, 200, leads);
});

export const getLead = catchAsync(async (req: Request | any, res: Response) => {
  const lead = await leadService.getById(req.params.id);
  return sendSuccess(res, 200, lead);
});

export const updateLeadStage = catchAsync(async (req: Request | any, res: Response) => {
  const { stage } = updateStageSchema.parse(req.body);
  const lead = await leadService.updateStage(req.params.id, stage);
  return sendSuccess(res, 200, lead, "Lead stage updated");
});

export const reassignLead = catchAsync(async (req: Request | any, res: Response) => {
  const { agentId } = req.body;
  if (!agentId) throw ApiError.badRequest("agentId is required");
  const lead = await leadService.reassign(req.params.id, agentId);
  return sendSuccess(res, 200, lead, "Lead reassigned");
});

export const addLeadActivity = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { note } = addActivitySchema.parse(req.body);
  const lead = await leadService.addActivity(req.params.id, note, req.user.id);
  return sendSuccess(res, 200, lead, "Activity logged");
});

export const scheduleInspection = catchAsync(async (req: Request | any, res: Response) => {
  const input = scheduleInspectionSchema.parse(req.body);
  const lead = await leadService.scheduleInspection(req.params.id, {
    ...input,
    scheduledAt: new Date(input.scheduledAt),
  });
  return sendSuccess(res, 200, lead, "Inspection scheduled");
});

export const rescheduleInspection = catchAsync(async (req: Request | any, res: Response) => {
  const input = rescheduleInspectionSchema.parse(req.body);
  const lead = await leadService.rescheduleInspection(req.params.id, {
    ...input,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
  });
  return sendSuccess(res, 200, lead, "Inspection rescheduled");
});

export const salesFunnel = catchAsync(async (_req: Request | any, res: Response) => {
  const funnel = await leadService.salesFunnel();
  return sendSuccess(res, 200, funnel);
});

export const topAgents = catchAsync(async (_req: Request | any, res: Response) => {
  const rankings = await leadService.topAgents();
  return sendSuccess(res, 200, rankings);
});