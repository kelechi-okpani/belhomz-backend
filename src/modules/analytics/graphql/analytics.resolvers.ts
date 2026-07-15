import { analyticsService } from "../services/analytics.service";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireAuth } from "../../../shared/graphql/guards";

export const analyticsResolvers = {
  Query: {
    analytics: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return analyticsService.getAnalytics(user);
    },
  },
};