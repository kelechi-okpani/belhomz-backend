import { gql } from "graphql-tag";

export const analyticsTypeDefs = gql`
  """
  Everything the dashboard needs, in one shape. Sections that don't
  apply to the requesting user's role come back as null (e.g. an AGENT
  gets 'myPerformance' populated but 'agentLeaderboard' null; the
  reverse is true for OWNER) — the same permission rules already
  enforced elsewhere, just returned from a single query instead of
  requiring one request per widget.
  """
  type AnalyticsPayload {
    "Visible to everyone"
    todaysLeadCount: Int!
    propertyAvailability: AvailabilitySnapshot!
    myActivityStats: MyActivityStats!
    recentActivity: [Activity!]!

    "OWNER only"
    salesFunnel: [FunnelStage!]
    topAgents: [AgentRanking!]
    agentLeaderboard: [AgentPerformance!]

    "OWNER and FINANCE"
    revenueTrend: [RevenueMonth!]
    monthlyRevenue: Float
    pendingPayments: [Payment!]
    overduePayments: [Payment!]

    "AGENT only"
    myPerformance: AgentPerformance
  }

  extend type Query {
    analytics: AnalyticsPayload!
  }
`;