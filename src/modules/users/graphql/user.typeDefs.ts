
import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  extend type Query {
    staff: [PublicUser!]!
    user(id: ID!): PublicUser!
    profile: PublicUser!
  }

  input UpdateProfileInput {
    name: String
    phone: String
  }

  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): PublicUser!
    changeUserRole(id: ID!, role: UserRole!): PublicUser!
    deactivateUser(id: ID!): PublicUser!
    reactivateUser(id: ID!): PublicUser!
  }
`;
