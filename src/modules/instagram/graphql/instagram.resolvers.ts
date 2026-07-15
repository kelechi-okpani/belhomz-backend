import { InstagramService } from '../services/instagram.service';
import { validateGetPostsInput } from '../validators/instagram.validator';

const instagramService = new InstagramService();

export const instagramResolvers = {
  Query: {
    getInstagramFeed: async (_: unknown, args: { page?: number; limit?: number }) => {
      const { page, limit } = validateGetPostsInput(args);
      return await instagramService.getFeed(page, limit);
    },
    getInstagramPost: async (_: unknown, args: { id: string }) => {
      return await instagramService.getPostById(args.id);
    },
  },
};