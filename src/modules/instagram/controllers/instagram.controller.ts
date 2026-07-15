import { Request, Response } from 'express';
import { InstagramService } from '../services/instagram.service';
import { validateGetPostsInput } from '../validators/instagram.validator';

const instagramService = new InstagramService();

export class InstagramController {
  static async getFeed(req: Request | any, res: Response) {
    try {
      const { page, limit } = validateGetPostsInput({
        page: req.query.page as string,
        limit: req.query.limit as string,
      });

      const feed = await instagramService.getFeed(page, limit);
      return res.status(200).json({ success: true, data: feed });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPostById(req: Request | any, res: Response) {
    try {
      const post = await instagramService.getPostById(req.params.id);
      return res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}