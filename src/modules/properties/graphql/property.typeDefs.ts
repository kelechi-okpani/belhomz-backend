import { gql } from "graphql-tag";

export const propertyTypeDefs = gql`
  enum PropertyStatus {
    AVAILABLE
    RESERVED
    SOLD
  }

  enum PropertyType {
    APARTMENT
    HOUSE
    LAND
    COMMERCIAL
    DUPLEX
  }

  type PropertyImage {
    url: String!
    publicId: String!
  }

  # New input type so GraphQL knows how to parse image objects in mutations
  input PropertyImageInput {
    url: String!
    publicId: String!
  }

  type Property {
    id: ID!
    title: String!
    description: String!
    price: Float!
    location: String!
    type: PropertyType!
    size: Float!
    amenities: [String!]!
    status: PropertyStatus!
    images: [PropertyImage!]!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  type PropertyList {
    items: [Property!]!
    total: Int!
  }

  type AvailabilitySnapshot {
    available: Int!
    reserved: Int!
    sold: Int!
  }

  input CreatePropertyInput {
    title: String!
    description: String!
    price: Float!
    location: String!
    type: PropertyType!
    size: Float!
    amenities: [String!]
    images: [PropertyImageInput!] # Added images array here
  }

  input UpdatePropertyInput {
    title: String
    description: String
    price: Float
    location: String
    type: PropertyType
    size: Float
    amenities: [String!]
    images: [PropertyImageInput!] # Added images array here
  }

  input PropertyFilterInput {
    status: PropertyStatus
    location: String
    minPrice: Float
    maxPrice: Float
    search: String
    page: Int
    limit: Int
  }

  extend type Query {
    properties(filter: PropertyFilterInput): PropertyList!
    property(id: ID!): Property!
    propertyAvailability: AvailabilitySnapshot!
  }

  extend type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    updateProperty(id: ID!, input: UpdatePropertyInput!): Property!
    updatePropertyStatus(id: ID!, status: PropertyStatus!): Property!
    deleteProperty(id: ID!): Boolean!
  }
`;