import { InstagramPost, IInstagramPost } from '../models/instagram-post.model';

export class InstagramRepository {
  async findPosts(limit: number = 10, skip: number = 0): Promise<IInstagramPost[]> {
    return InstagramPost.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countPosts(): Promise<number> {
    return InstagramPost.countDocuments();
  }

  async findById(id: string): Promise<IInstagramPost | null> {
    return InstagramPost.findById(id).lean();
  }
}