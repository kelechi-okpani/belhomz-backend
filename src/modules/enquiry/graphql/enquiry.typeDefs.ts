import { gql } from 'graphql-tag';

export const enquiryTypeDefs = gql`
  enum EnquiryStatus {
    PENDING
    IN_PROGRESS
    RESOLVED
    ARCHIVED
  }

  type Enquiry {
    _id: ID!
    fullName: String!
    email: String!
    phone: String
    subject: String!
    message: String!
    status: EnquiryStatus!
    createdAt: String!
    updatedAt: String!
  }

  type EnquiryPaginationMeta {
    total: Int!
    page: Int!
    pages: Int!
  }

  type EnquiryFeedResponse {
    enquiries: [Enquiry!]!
    pagination: EnquiryPaginationMeta!
  }

  input CreateEnquiryInput {
    fullName: String!
    email: String!
    phone: String
    subject: String!
    message: String!
  }

  extend type Query {
    getEnquiries(page: Int, limit: Int, status: EnquiryStatus): EnquiryFeedResponse!
    getEnquiryById(id: ID!): Enquiry
  }

  extend type Mutation {
    createEnquiry(input: CreateEnquiryInput!): Enquiry!
    updateEnquiryStatus(id: ID!, status: EnquiryStatus!): Enquiry!
  }
`;