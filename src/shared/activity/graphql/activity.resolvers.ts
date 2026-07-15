import { activityFeedService } from "../services/activity.service";
import { pubsub, ACTIVITY_FEED_CHANNEL } from "../../../config/pubsub";
import { GraphQLContext } from "../../graphql/context";
import { requireAuth } from "../../graphql/guards";

export const activityResolvers = {
  Query: {
    activities: async (_: unknown, args: { limit?: number }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return activityFeedService.recent(args.limit ?? 30);
    },
    myActivityStats: async (_: unknown, args: { days?: number }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const since = args.days
        ? new Date(Date.now() - args.days * 24 * 60 * 60 * 1000)
        : undefined;
      return activityFeedService.statsForActor(user.id, since);
    },
  },
  Subscription: {
    activityFeed: {
      // Auth check happens once, at subscribe time — only logged-in
      // clients are allowed to open the socket in the first place.
      subscribe: (_: unknown, __: unknown, ctx: GraphQLContext) => {
        requireAuth(ctx);
        return pubsub.asyncIterator(ACTIVITY_FEED_CHANNEL);
      },
    },
  },
};