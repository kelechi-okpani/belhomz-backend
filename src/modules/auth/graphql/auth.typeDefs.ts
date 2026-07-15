import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  enum UserRole {
    OWNER
    AGENT
    STAFF
  }

  type PublicUser {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    phone: String
    isActive: Boolean!
  }

  type AuthTokens {
    accessToken: String!
    refreshToken: String!
  }

  type AuthPayload {
    user: PublicUser!
    tokens: AuthTokens!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: UserRole!
    phone: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: PublicUser!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthTokens!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
  }
`;
