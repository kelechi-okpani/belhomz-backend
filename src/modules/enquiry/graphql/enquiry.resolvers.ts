import { EnquiryService } from '../services/enquiry.service';
import { validateGetEnquiriesInput } from '../validators/enquiry.validator';
import { EnquiryStatus } from '../models/enquiry.model';
import { requireAuth, requireRoles } from "../../../shared/graphql/guards";
import { UserRole } from "../../users/interfaces/user.interface";
import { GraphQLContext } from "../../../shared/graphql/context";

const enquiryService = new EnquiryService();

export const enquiryResolvers = {
  Query: {
    getEnquiries: async (
      _: unknown,
      args: { page?: number; limit?: number; status?: EnquiryStatus },
      ctx: GraphQLContext
    ) => {
      // 1. Authenticate / Authorize
      requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);

      // 2. Validate inputs
      const { page, limit, status } = validateGetEnquiriesInput(args);

      // 3. Fetch data
      return await enquiryService.getEnquiries(page, limit, status);
    },

    getEnquiryById: async (
      _: unknown, 
      args: { id: string }, 
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);
      return await enquiryService.getEnquiryById(args.id);
    },
  },

  Mutation: {
    createEnquiry: async (_: unknown, args: { input: any }) => {
      // Public or authenticated creation depending on your flow
      return await enquiryService.createEnquiry(args.input);
    },

    updateEnquiryStatus: async (
      _: unknown,
      args: { id: string; status: EnquiryStatus },
      ctx: GraphQLContext
    ) => {
      requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);
      return await enquiryService.updateEnquiryStatus(args.id, args.status);
    },
  },
};