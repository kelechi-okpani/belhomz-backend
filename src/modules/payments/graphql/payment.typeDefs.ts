import { gql } from "graphql-tag";

export const paymentTypeDefs = gql`
  enum PaymentStatus {
    PENDING
    PAID
    OVERDUE
  }

  enum PaymentMethod {
    BANK_TRANSFER
    CASH
    CARD
    OTHER
  }

  type Installment {
    id: ID!
    amount: Float!
    dueDate: String!
    status: PaymentStatus!
    paidAt: String
  }

  type Payment {
    id: ID!
    clientName: String!
    clientPhone: String!
    property: ID!
    lead: ID
    totalAmount: Float!
    amountPaid: Float!
    method: PaymentMethod!
    installments: [Installment!]!
    recordedBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  input InstallmentInput {
    amount: Float!
    dueDate: String!
  }

  input CreatePaymentInput {
    clientName: String!
    clientPhone: String!
    property: ID!
    lead: ID
    totalAmount: Float!
    method: PaymentMethod!
    installments: [InstallmentInput!]!
  }

  extend type Query {
    payments: [Payment!]!
    payment(id: ID!): Payment!
    pendingPayments: [Payment!]!
    overduePayments: [Payment!]!
    monthlyRevenue: Float!
    revenueTrend(months: Int): [RevenueMonth!]!
  }

  type RevenueMonth {
    month: String!
    total: Float!
  }

  extend type Mutation {
    createPayment(input: CreatePaymentInput!): Payment!
    recordInstallmentPayment(paymentId: ID!, installmentId: ID!, amount: Float!): Payment!
  }
`;