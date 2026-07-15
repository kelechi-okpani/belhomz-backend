import { UserRole } from "../../users/interfaces/user.interface";
import { leadService } from "../../leads/services/lead.service";
import { propertyService } from "../../properties/services/property.service";
import { paymentService } from "../../payments/services/payment.service";
import { activityFeedService } from "../../../shared/activity/services/activity.service";

interface AuthedUser {
  id: string;
  role: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class AnalyticsService {
  /**
   * Single entry point for everything the dashboard needs. One call,
   * one round trip — the alternative (a Query per widget: salesFunnel,
   * topAgents, myPerformance, revenueTrend, activities, ...) meant the
   * frontend had to know which queries applied to which role and fire
   * off five or six separate requests on every dashboard load. Here,
   * the role-based decision of "what does this person actually get to
   * see" lives in exactly one place, server-side, and the response
   * simply omits (returns null for) sections a role isn't entitled to
   * — the same rule the resolvers already enforce individually, just
   * centralized instead of duplicated per-field.
   */
  async getAnalytics(user: AuthedUser) {
    const isOwner = user.role === UserRole.OWNER;
    const isAgent = user.role === UserRole.AGENT;
    const canViewPayments = isOwner;

    const [
      todaysLeadCount,
      propertyAvailability,
      myActivityStats,
      recentActivity,
      salesFunnel,
      topAgents,
      agentLeaderboard,
      revenueTrend,
      monthlyRevenue,
      pendingPayments,
      overduePayments,
      myPerformance,
    ] = await Promise.all([
      leadService.todaysLeadCount(),
      propertyService.availabilitySnapshot(),
      activityFeedService.statsForActor(user.id, new Date(Date.now() - THIRTY_DAYS_MS)),
      activityFeedService.recent(20),
      isOwner ? leadService.salesFunnel() : Promise.resolve(null),
      isOwner ? leadService.topAgents() : Promise.resolve(null),
      isOwner ? leadService.allAgentPerformance() : Promise.resolve(null),
      canViewPayments ? paymentService.revenueTrend(6) : Promise.resolve(null),
      canViewPayments ? paymentService.monthlyRevenue() : Promise.resolve(null),
      canViewPayments ? paymentService.pending() : Promise.resolve(null),
      canViewPayments ? paymentService.overdue() : Promise.resolve(null),
      isAgent ? leadService.myPerformance(user.id) : Promise.resolve(null),
    ]);

    return {
      todaysLeadCount,
      propertyAvailability,
      myActivityStats,
      recentActivity,
      salesFunnel,
      topAgents,
      agentLeaderboard,
      revenueTrend,
      monthlyRevenue,
      pendingPayments,
      overduePayments,
      myPerformance,
    };
  }
}

export const analyticsService = new AnalyticsService();