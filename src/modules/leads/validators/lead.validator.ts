import { z } from "zod";
import { LeadStage } from "../interfaces/lead.interface";

export const createLeadSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(7),
  clientEmail: z.string().email().optional(),
  property: z.string().optional(),
  assignedAgent: z.string().min(1),
});

export const updateStageSchema = z.object({
  stage: z.nativeEnum(LeadStage),
});

export const addActivitySchema = z.object({
  note: z.string().min(1),
});

export const scheduleInspectionSchema = z.object({
  scheduledAt: z.string().datetime().or(z.date()),
  location: z.string().min(2),
  notes: z.string().optional(),
});
