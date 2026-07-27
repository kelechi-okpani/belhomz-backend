import { leadRepository, LeadFilter } from "../repositories/lead.repository";
import { ApiError } from "../../../shared/utils/ApiError";
import { LeadStage } from "../interfaces/lead.interface";
import { activityFeedService } from "../../../shared/activity/services/activity.service";
import { ActivityType } from "../../../shared/activity/models/activity.model";
import { userRepository } from "../../users/repositories/user.repository";
import { sendEmail } from "@/src/config/email";
import { buildInspectionEmail } from "@/src/helper/lead.templates";



export class LeadService {
  async create(data: Record<string, unknown>, actor?: string) {
    const lead = await leadRepository.create(data as any);
    await activityFeedService.record({
      type: ActivityType.LEAD_CREATED,
      message: `New lead added: ${lead.clientName}`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });
    return lead;
  }

  async getById(id: string) {
    const lead = await leadRepository.findById(id);
    if (!lead) throw ApiError.notFound("Lead not found");
    return lead;
  }

  async list(filter: LeadFilter) {
    return leadRepository.find(filter);
  }

  async update(id: string, data: Record<string, unknown>, actor?: string) {
    const lead = await leadRepository.update(id, data as any);
    if (!lead) throw ApiError.notFound("Lead not found");

    await activityFeedService.record({
      type: ActivityType.LEAD_STAGE_CHANGED,
      message: `Updated details for lead: ${lead.clientName}`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });
    return lead;
  }

  async updateStage(id: string, stage: LeadStage, actor?: string) {
    const lead = await leadRepository.updateStage(id, stage);
    if (!lead) throw ApiError.notFound("Lead not found");
    await activityFeedService.record({
      type: ActivityType.LEAD_STAGE_CHANGED,
      message: `${lead.clientName} moved to ${stage.replace(/_/g, " ").toLowerCase()}`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });
    return lead;
  }

  async reassign(id: string, agentId: string, actor?: string) {
    const lead = await leadRepository.reassign(id, agentId);
    if (!lead) throw ApiError.notFound("Lead not found");
    await activityFeedService.record({
      type: ActivityType.LEAD_REASSIGNED,
      message: `${lead.clientName} reassigned to a different agent`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });
    return lead;
  }

  async addActivity(id: string, note: string, createdBy: string) {
    const lead = await leadRepository.addActivity(id, note, createdBy);
    if (!lead) throw ApiError.notFound("Lead not found");
    await activityFeedService.record({
      type: ActivityType.LEAD_NOTE_ADDED,
      message: `Note added for ${lead.clientName}`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor: createdBy,
    });
    return lead;
  }


  async salesFunnel() {
    const stages = Object.values(LeadStage);
    const counts = await Promise.all(stages.map((stage) => leadRepository.countByStage(stage)));
    return stages.map((stage, i) => ({ stage, count: counts[i] }));
  }

  // Pass optional agentId to count created today for specific agent
  async todaysLeadCount(agentId?: string) {
    return leadRepository.countCreatedToday(agentId);
  }

  async topAgents() {
    return leadRepository.countClosedWonByAgent();
  }

  async myPerformance(agentId: string) {
    return leadRepository.statsForAgent(agentId);
  }

  async allAgentPerformance() {
    const stats = await leadRepository.statsForAllAgents();
    if (stats.length === 0) return [];

    const agents = await userRepository.findAll({ _id: { $in: stats.map((s) => s.agentId) } });
    const nameById = new Map(agents.map((a) => [String(a._id), a.name]));

    return stats
      .map((s) => ({ ...s, agentName: nameById.get(String(s.agentId)) ?? "Unknown agent" }))
      .sort((a, b) => b.closedWon - a.closedWon);
  }

  async scheduleInspection(
    id: string,
    inspection: { scheduledAt: Date; location: string; notes?: string },
    actor?: string
  ) {
    const lead = await leadRepository.setInspection(id, inspection);
    if (!lead) throw ApiError.notFound("Lead not found");

    await activityFeedService.record({
      type: ActivityType.INSPECTION_SCHEDULED,
      message: `Inspection booked for ${lead.clientName} at ${inspection.location}`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });

    if (lead.clientEmail) {
      try {
        await sendEmail({
          to: lead.clientEmail,
          subject: "Your inspection has been booked — Belhomz",
          html: buildInspectionEmail({
            clientName: lead.clientName,
            scheduledAt: inspection.scheduledAt,
            location: inspection.location,
            notes: inspection.notes,
          }),
        });
      } catch (err) {
        console.error(`[email] Failed to send inspection confirmation to ${lead.clientEmail}:`, err);
      }
    }

    return lead;
  }

  async rescheduleInspection(
    id: string,
    updates: { scheduledAt?: Date; location?: string; notes?: string },
    actor?: string
  ) {
    const existing = await leadRepository.findById(id);
    if (!existing) throw ApiError.notFound("Lead not found");
    if (!existing.inspection) {
      throw ApiError.badRequest("No inspection has been booked for this lead yet");
    }

    const lead = await leadRepository.rescheduleInspection(id, updates);
    if (!lead) throw ApiError.notFound("Lead not found");

    await activityFeedService.record({
      type: ActivityType.INSPECTION_SCHEDULED,
      message: `Inspection rescheduled for ${lead.clientName}${
        updates.scheduledAt ? ` to ${updates.scheduledAt.toLocaleString()}` : ""
      }`,
      entityType: "Lead",
      entityId: (lead as any)._id,
      actor,
    });

    if (lead.clientEmail && lead.inspection) {
      try {
        await sendEmail({
          to: lead.clientEmail,
          subject: "Your inspection has been rescheduled — Belhomz",
          html: buildInspectionEmail({
            clientName: lead.clientName,
            scheduledAt: lead.inspection.scheduledAt,
            location: lead.inspection.location,
            notes: lead.inspection.notes,
            isReschedule: true,
          }),
        });
      } catch (err) {
        console.error(`[email] Failed to send reschedule confirmation to ${lead.clientEmail}:`, err);
      }
    }

    return lead;
  }
}

export const leadService = new LeadService();

// import { leadRepository, LeadFilter } from "../repositories/lead.repository";
// import { ApiError } from "../../../shared/utils/ApiError";
// import { LeadStage } from "../interfaces/lead.interface";
// import { activityFeedService } from "../../../shared/activity/services/activity.service";
// import { ActivityType } from "../../../shared/activity/models/activity.model";
// import { userRepository } from "../../users/repositories/user.repository";

// export class LeadService {
//   async create(data: Record<string, unknown>, actor?: string) {
//     const lead = await leadRepository.create(data as any);
//     await activityFeedService.record({
//       type: ActivityType.LEAD_CREATED,
//       message: `New lead added: ${lead.clientName}`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor,
//     });
//     return lead;
//   }

//   async getById(id: string) {
//     const lead = await leadRepository.findById(id);
//     if (!lead) throw ApiError.notFound("Lead not found");
//     return lead;
//   }

//   async list(filter: LeadFilter) {
//     return leadRepository.find(filter);
//   }


//   async update(id: string, data: Record<string, unknown>, actor?: string) {
//     // Call repository update (ensure leadRepository.update exists or uses findByIdAndUpdate)
//     const lead = await leadRepository.update(id, data as any);
//     if (!lead) throw ApiError.notFound("Lead not found");

//     await activityFeedService.record({
//       type: ActivityType.LEAD_STAGE_CHANGED, // Or custom update type if defined
//       message: `Updated details for lead: ${lead.clientName}`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor,
//     });
//     return lead;
//   }

//   async updateStage(id: string, stage: LeadStage, actor?: string) {
//     const lead = await leadRepository.updateStage(id, stage);
//     if (!lead) throw ApiError.notFound("Lead not found");
//     await activityFeedService.record({
//       type: ActivityType.LEAD_STAGE_CHANGED,
//       message: `${lead.clientName} moved to ${stage.replace(/_/g, " ").toLowerCase()}`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor,
//     });
//     return lead;
//   }

//   async reassign(id: string, agentId: string, actor?: string) {
//     const lead = await leadRepository.reassign(id, agentId);
//     if (!lead) throw ApiError.notFound("Lead not found");
//     await activityFeedService.record({
//       type: ActivityType.LEAD_REASSIGNED,
//       message: `${lead.clientName} reassigned to a different agent`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor,
//     });
//     return lead;
//   }

//   async addActivity(id: string, note: string, createdBy: string) {
//     const lead = await leadRepository.addActivity(id, note, createdBy);
//     if (!lead) throw ApiError.notFound("Lead not found");
//     await activityFeedService.record({
//       type: ActivityType.LEAD_NOTE_ADDED,
//       message: `Note added for ${lead.clientName}`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor: createdBy,
//     });
//     return lead;
//   }

//   async scheduleInspection(
//     id: string,
//     inspection: { scheduledAt: Date; location: string; notes?: string },
//     actor?: string
//   ) {
//     const lead = await leadRepository.setInspection(id, inspection);
//     if (!lead) throw ApiError.notFound("Lead not found");
//     await activityFeedService.record({
//       type: ActivityType.INSPECTION_SCHEDULED,
//       message: `Inspection booked for ${lead.clientName} at ${inspection.location}`,
//       entityType: "Lead",
//       entityId: (lead as any)._id,
//       actor,
//     });
//     return lead;
//   }

//   async salesFunnel() {
//     const stages = Object.values(LeadStage);
//     const counts = await Promise.all(stages.map((stage) => leadRepository.countByStage(stage)));
//     return stages.map((stage, i) => ({ stage, count: counts[i] }));
//   }

//   async todaysLeadCount() {
//     return leadRepository.countCreatedToday();
//   }

//   async topAgents() {
//     return leadRepository.countClosedWonByAgent();
//   }

//   async myPerformance(agentId: string) {
//     return leadRepository.statsForAgent(agentId);
//   }

//   async allAgentPerformance() {
//     const stats = await leadRepository.statsForAllAgents();
//     if (stats.length === 0) return [];

//     const agents = await userRepository.findAll({ _id: { $in: stats.map((s) => s.agentId) } });
//     const nameById = new Map(agents.map((a) => [String(a._id), a.name]));

//     return stats
//       .map((s) => ({ ...s, agentName: nameById.get(String(s.agentId)) ?? "Unknown agent" }))
//       .sort((a, b) => b.closedWon - a.closedWon);
//   }
// }

// export const leadService = new LeadService();