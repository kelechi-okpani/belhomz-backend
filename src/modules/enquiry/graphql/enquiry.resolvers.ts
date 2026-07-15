import { EnquiryService } from '../services/enquiry.service';
import { validateGetEnquiriesInput } from '../validators/enquiry.validator';
import { EnquiryStatus } from '../models/enquiry.model';

const enquiryService = new EnquiryService();

export const enquiryResolvers = {
  Query: {
    getEnquiries: async (
      _: unknown,
      args: { page?: number; limit?: number; status?: EnquiryStatus }
    ) => {
      const { page, limit, status } = validateGetEnquiriesInput(args);
      return await enquiryService.getEnquiries(page, limit, status);
    },
    getEnquiryById: async (_: unknown, args: { id: string }) => {
      return await enquiryService.getEnquiryById(args.id);
    },
  },

  Mutation: {
    createEnquiry: async (_: unknown, args: { input: any }) => {
      return await enquiryService.createEnquiry(args.input);
    },
    updateEnquiryStatus: async (
      _: unknown,
      args: { id: string; status: EnquiryStatus }
    ) => {
      return await enquiryService.updateEnquiryStatus(args.id, args.status);
    },
  },
};