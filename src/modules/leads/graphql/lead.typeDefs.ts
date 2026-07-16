import { gql } from "graphql-tag";

export const leadTypeDefs = gql`
  enum LeadStage {
    NEW
    CONTACTED
    INSPECTION_BOOKED
    NEGOTIATION
    CLOSED_WON
    CLOSED_LOST
  }

  type LeadActivity {
    note: String!
    createdBy: ID!
    createdAt: String!
  }

  type Inspection {
    scheduledAt: String!
    location: String!
    notes: String
    completed: Boolean!
  }

  type Lead {
    id: ID!
    clientName: String!
    clientPhone: String!
    clientEmail: String
    property: ID
    assignedAgent: ID!
    stage: LeadStage!
    activities: [LeadActivity!]!
    inspection: Inspection
    createdAt: String!
    updatedAt: String!
  }

  type FunnelStage {
    stage: LeadStage!
    count: Int!
  }

  type AgentRanking {
    agentId: ID!
    count: Int!
  }

  type StageBreakdown {
    stage: String!
    count: Int!
  }

  type AgentPerformance {
    agentId: ID!
    agentName: String
    totalLeads: Int!
    byStage: [StageBreakdown!]!
    closedWon: Int!
    closedLost: Int!
    conversionRate: Int!
  }

  input CreateLeadInput {
    clientName: String!
    clientPhone: String!
    clientEmail: String
    property: ID
    assignedAgent: ID!
    stage: LeadStage!
  }

  
  input UpdateLeadInput {
    clientName: String
    clientPhone: String
    clientEmail: String
    property: ID!
    stage: LeadStage!
  }


  input ScheduleInspectionInput {
    scheduledAt: String!
    location: String!
    notes: String
    stage: LeadStage!
  }

  input LeadFilterInput {
    assignedAgent: ID
    stage: LeadStage
  }

  extend type Query {
    leads(filter: LeadFilterInput): [Lead!]!
    lead(id: ID!): Lead!
    salesFunnel: [FunnelStage!]!
    todaysLeadCount: Int!
    topAgents: [AgentRanking!]!
    myPerformance: AgentPerformance!
    allAgentPerformance: [AgentPerformance!]!
  }

  extend type Mutation {
    createLead(input: CreateLeadInput!): Lead!
    updateLead(id: ID!, input: UpdateLeadInput!): Lead!
    updateLeadStage(id: ID!, stage: LeadStage!): Lead!
    reassignLead(id: ID!, agentId: ID!): Lead!
    addLeadActivity(id: ID!, note: String!): Lead!
    scheduleInspection(id: ID!, input: ScheduleInspectionInput!): Lead!
  }
`;