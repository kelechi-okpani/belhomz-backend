import { gql } from 'graphql-tag';

export const instagramTypeDefs = gql`
  type InstagramPost {
    _id: ID!
    instagramId: String!
    caption: String
    mediaType: String!
    mediaUrl: String!
    permalink: String!
    thumbnailUrl: String!
    timestamp: String!
    lastSyncedAt: String!
  }

  type PaginationMeta {
    total: Int!
    page: Int!
    pages: Int!
  }

  type InstagramFeedResponse {
    posts: [InstagramPost!]!
    pagination: PaginationMeta!
  }

  extend type Query {
    getInstagramFeed(page: Int, limit: Int): InstagramFeedResponse!
    getInstagramPost(id: ID!): InstagramPost
  }
`;