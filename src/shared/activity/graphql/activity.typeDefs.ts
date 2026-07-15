import { gql } from "graphql-tag";

export const activityTypeDefs = gql`
  enum ActivityType {
    LEAD_CREATED
    LEAD_STAGE_CHANGED
    LEAD_REASSIGNED
    LEAD_NOTE_ADDED
    INSPECTION_SCHEDULED
    PROPERTY_CREATED
    PROPERTY_UPDATED
    PROPERTY_STATUS_CHANGED
    PROPERTY_DELETED
    PAYMENT_CREATED
    INSTALLMENT_PAID
    STAFF_ACCOUNT_CREATED
    STAFF_ROLE_CHANGED
    STAFF_DEACTIVATED
    STAFF_REACTIVATED
  }

  type Activity {
    id: ID!
    type: ActivityType!
    message: String!
    entityType: String!
    entityId: ID!
    actor: ID
    createdAt: String!
  }

  extend type Query {
    activities(limit: Int): [Activity!]!
    myActivityStats(days: Int): MyActivityStats!
  }

  type ActivityTypeBreakdown {
    type: ActivityType!
    count: Int!
  }

  type MyActivityStats {
    total: Int!
    byType: [ActivityTypeBreakdown!]!
  }

  type Subscription {
    activityFeed: Activity!
  }
`;