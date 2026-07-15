import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

import { authTypeDefs } from "../../modules/auth/graphql/auth.typeDefs";
import { authResolvers } from "../../modules/auth/graphql/auth.resolvers";

import { userTypeDefs } from "../../modules/users/graphql/user.typeDefs";
import { userResolvers } from "../../modules/users/graphql/user.resolvers";

import { propertyTypeDefs } from "../../modules/properties/graphql/property.typeDefs";
import { propertyResolvers } from "../../modules/properties/graphql/property.resolvers";

import { leadTypeDefs } from "../../modules/leads/graphql/lead.typeDefs";
import { leadResolvers } from "../../modules/leads/graphql/lead.resolvers";

import { paymentTypeDefs } from "../../modules/payments/graphql/payment.typeDefs";
import { paymentResolvers } from "../../modules/payments/graphql/payment.resolvers";

import { activityTypeDefs } from "../activity/graphql/activity.typeDefs";
import { activityResolvers } from "../activity/graphql/activity.resolvers";

import { instagramResolvers } from "../../modules/instagram/graphql/instagram.resolvers";
import { instagramTypeDefs } from "../../modules/instagram/graphql/instagram.typeDefs";

import { enquiryResolvers } from "../../modules/enquiry/graphql/enquiry.resolvers";
import { enquiryTypeDefs } from "../../modules/enquiry/graphql/enquiry.typeDefs";

import { analyticsTypeDefs } from "../../modules/analytics/graphql/analytics.typeDefs";
import { analyticsResolvers } from "../../modules/analytics/graphql/analytics.resolvers";

import { scalarTypeDefs, scalarResolvers } from "./scalar";

const typeDefs = mergeTypeDefs([
   scalarTypeDefs,
  authTypeDefs,
  userTypeDefs,
  propertyTypeDefs,
  leadTypeDefs,
  paymentTypeDefs,
  activityTypeDefs,
  instagramTypeDefs,
  enquiryTypeDefs,
   analyticsTypeDefs,
]);

const resolvers = mergeResolvers([
  scalarResolvers,
  authResolvers,
  userResolvers,
  propertyResolvers,
  leadResolvers,
  paymentResolvers,
  activityResolvers,
  instagramResolvers,


  enquiryResolvers,
  analyticsResolvers 
]);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
