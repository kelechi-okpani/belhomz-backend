import { Types } from "mongoose";
import { LeadModel, LeadDocument } from "../models/lead.model";
import { LeadStage } from "../interfaces/lead.interface";

export interface LeadFilter {
  assignedAgent?: string;
  stage?: LeadStage;
}

export class LeadRepository {
  async create(data: Partial<LeadDocument>): Promise<LeadDocument> {
    return LeadModel.create(data);
  }

  async findById(id: string): Promise<LeadDocument | null> {
    return LeadModel.findById(id).exec();
  }

  async find(filter: LeadFilter): Promise<LeadDocument[]> {
    const query: Record<string, unknown> = {};
    if (filter.assignedAgent) query.assignedAgent = filter.assignedAgent;
    if (filter.stage) query.stage = filter.stage;
    return LeadModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateStage(id: string, stage: LeadStage): Promise<LeadDocument | null> {
    return LeadModel.findByIdAndUpdate(id, { stage }, { new: true }).exec();
  }

  async reassign(id: string, agentId: string): Promise<LeadDocument | null> {
    return LeadModel.findByIdAndUpdate(id, { assignedAgent: agentId }, { new: true }).exec();
  }

  async addActivity(id: string, note: string, createdBy: string): Promise<LeadDocument | null> {
    return LeadModel.findByIdAndUpdate(
      id,
      { $push: { activities: { note, createdBy, createdAt: new Date() } } },
      { new: true }
    ).exec();
  }

  async setInspection(
    id: string,
    inspection: { scheduledAt: Date; location: string; notes?: string }
  ): Promise<LeadDocument | null> {
    return LeadModel.findByIdAndUpdate(
      id,
      { inspection: { ...inspection, completed: false }, stage: LeadStage.INSPECTION_BOOKED },
      { new: true }
    ).exec();
  }

  async countByStage(stage: LeadStage): Promise<number> {
    return LeadModel.countDocuments({ stage });
  }

  async countCreatedToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return LeadModel.countDocuments({ createdAt: { $gte: startOfDay } });
  }

  async countClosedWonByAgent(): Promise<{ agentId: string; count: number }[]> {
    const results = await LeadModel.aggregate([
      { $match: { stage: LeadStage.CLOSED_WON } },
      { $group: { _id: "$assignedAgent", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return results.map((r) => ({ agentId: String(r._id), count: r.count }));
  }

  /**
   * Full pipeline breakdown for a single agent — how many leads they have
   * in each stage, plus totals and a conversion rate. Powers both the
   * agent's own "My Performance" view and the Owner's per-agent drill-down.
   */
  async statsForAgent(agentId: string) {
    const results = await LeadModel.aggregate([
      { $match: { assignedAgent: new Types.ObjectId(agentId) } },
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const byStage: Record<string, number> = {};
    let total = 0;
    for (const r of results) {
      byStage[r._id] = r.count;
      total += r.count;
    }

    const closedWon = byStage[LeadStage.CLOSED_WON] ?? 0;
    const closedLost = byStage[LeadStage.CLOSED_LOST] ?? 0;
    const closedTotal = closedWon + closedLost;

    return {
      agentId,
      totalLeads: total,
      byStage: Object.entries(byStage).map(([stage, count]) => ({ stage, count })),
      closedWon,
      closedLost,
      // Conversion rate is only meaningful once a lead has actually
      // closed one way or the other — leads still mid-pipeline shouldn't
      // drag the rate down artificially.
      conversionRate: closedTotal > 0 ? Math.round((closedWon / closedTotal) * 100) : 0,
    };
  }

  /**
   * Same breakdown, for every agent that currently has at least one lead
   * assigned — used for the Owner's full team leaderboard.
   */
  async statsForAllAgents() {
    const agentIds = await LeadModel.distinct("assignedAgent");
    return Promise.all(agentIds.map((id) => this.statsForAgent(String(id))));
  }
}

export const leadRepository = new LeadRepository();