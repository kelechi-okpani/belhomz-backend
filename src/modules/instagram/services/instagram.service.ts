import { InstagramRepository } from '../repositories/instagram.repository';
// import { InstagramRepository } from '../repositories/instagram.repository';

export class InstagramService {
  private repo: InstagramRepository;

  constructor() {
    this.repo = new InstagramRepository();
  }

  async getFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.repo.findPosts(limit, skip),
      this.repo.countPosts(),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: string) {
    const post = await this.repo.findById(id);
    if (!post) {
      throw new Error('Instagram post not found');
    }
    return post;
  }
}