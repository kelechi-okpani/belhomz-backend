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
   * any connected GraphQL subscription clients.
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

  // Accepts optional actorId to restrict recent logs per user
  async recent(limit = 30, actorId?: string) {
    const query: Record<string, unknown> = {};
    if (actorId) {
      query.actor = new Types.ObjectId(actorId);
    }
    return ActivityModel.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }

  /**
   * Per-user activity breakdown — used for Staff/Agent "my activity" stats.
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