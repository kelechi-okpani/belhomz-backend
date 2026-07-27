import { z } from "zod";
import { LeadStage } from "../interfaces/lead.interface";

export const LeadStageEnum = z.enum([
  "NEW",
  "CONTACTED",
  "INSPECTION_BOOKED",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const createLeadSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  clientPhone: z.string().min(7, "Valid phone number is required"),
  clientEmail: z.string().email("Invalid email address").optional().nullable(),
  property: z.string().optional().nullable(),
  assignedAgent: z.string().min(1, "Assigned agent ID is required"),
  stage: LeadStageEnum,
});

export const updateLeadSchema = z.object({
  clientName: z.string().min(2).optional(),
  clientPhone: z.string().min(7).optional(),
  clientEmail: z.string().email().optional().nullable(),
  property: z.string().min(1, "Property ID is required"),
  stage: LeadStageEnum,
});

// Updated to match your new ScheduleInspectionInput GraphQL type
export const scheduleInspectionSchema = z.object({
  scheduledAt: z.string().datetime({ message: "Invalid ISO date string" }),
  location: z.string().min(1, "Location is required"),
  notes: z.string().min(1, "Notes are required"), // Required per GraphQL schema (notes: String!)
  stage: LeadStageEnum, // Added per GraphQL schema (stage: LeadStage!)
});


export const rescheduleInspectionSchema = z.object({
  scheduledAt: z.string().datetime({ message: "Invalid ISO date string" }).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export const updateStageSchema = z.object({
  stage: z.nativeEnum(LeadStage),
});

export const addActivitySchema = z.object({
  note: z.string().min(1),
});

