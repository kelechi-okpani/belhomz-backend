import { ActivityModel, ActivityType } from "../models/activity.model";
import { pubsub, ACTIVITY_FEED_CHANNEL } from "../../../config/pubsub";
import { logger } from "../../../config/logger";
import { Types } from "mongoose";

interface RecordActivityInput {
  type: ActivityType;
  message: string;
  entityType: string;
  entityId: string;
  actor?: string;
}

export class ActivityFeedService {
  /**
   * Persists an activity for history, and publishes it immediately to
   * any connected GraphQL subscription clients. Never throws — a failure
   * here (e.g. Redis briefly unavailable) should never break the actual
   * business operation (creating a lead, recording a payment, etc.) that
   * triggered it.
   */
  async record(input: RecordActivityInput): Promise<void> {
    try {
      const activity = await ActivityModel.create(input);
      await pubsub.publish(ACTIVITY_FEED_CHANNEL, {
        activityFeed: activity.toJSON(),
      });
    } catch (err) {
      logger.error(`Failed to record activity: ${err instanceof Error ? err.message : err}`);
    }
  }

  async recent(limit = 30) {
    return ActivityModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  /**
   * Per-user activity breakdown — used for Staff/Agent "my activity"
   * stats (e.g. how many notes a front-desk STAFF member has logged).
   */
  async statsForActor(actorId: string, since?: Date) {
    const match: Record<string, unknown> = { actor: new Types.ObjectId(actorId) };
    if (since) match.createdAt = { $gte: since };

    const results = await ActivityModel.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const byType: Record<string, number> = {};
    let total = 0;
    for (const r of results) {
      byType[r._id] = r.count;
      total += r.count;
    }

    return {
      actorId,
      total,
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    };
  }
}

export const activityFeedService = new ActivityFeedService();