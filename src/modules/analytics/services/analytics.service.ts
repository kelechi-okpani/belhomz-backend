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
  async getAnalytics(user: AuthedUser) {
    const isOwner = user.role === UserRole.OWNER;
    const isAgentOrStaff = user.role === UserRole.AGENT || user.role === UserRole.STAFF;
    const canViewPayments = isOwner;

    // Filter params: OWNER gets undefined (global stats), non-owners get their user ID
    const scopeUserId = isOwner ? undefined : user.id;

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
      leadService.todaysLeadCount(scopeUserId),
      propertyService.availabilitySnapshot(scopeUserId),
      activityFeedService.statsForActor(user.id, new Date(Date.now() - THIRTY_DAYS_MS)),
      activityFeedService.recent(20, scopeUserId),

      // OWNER-only aggregations
      isOwner ? leadService.salesFunnel() : Promise.resolve(null),
      isOwner ? leadService.topAgents() : Promise.resolve(null),
      isOwner ? leadService.allAgentPerformance() : Promise.resolve(null),

      // OWNER & FINANCE metrics
      canViewPayments ? paymentService.revenueTrend(6) : Promise.resolve(null),
      canViewPayments ? paymentService.monthlyRevenue() : Promise.resolve(null),
      canViewPayments ? paymentService.pending() : Promise.resolve(null),
      canViewPayments ? paymentService.overdue() : Promise.resolve(null),

      // AGENT/STAFF specific performance
      isAgentOrStaff ? leadService.myPerformance(user.id) : Promise.resolve(null),
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