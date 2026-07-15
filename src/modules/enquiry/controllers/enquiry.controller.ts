import { Request, Response } from 'express';
import { EnquiryService } from '../services/enquiry.service';
import { validateGetEnquiriesInput } from '../validators/enquiry.validator';
import { EnquiryStatus } from '../models/enquiry.model';

const enquiryService = new EnquiryService();

export class EnquiryController {
  static async createEnquiry(req: Request | any, res: Response) {
    try {
      const enquiry = await enquiryService.createEnquiry(req.body);
      return res.status(201).json({ success: true, data: enquiry });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getEnquiries(req: Request |any, res: Response) {
    try {
      const { page, limit, status } = validateGetEnquiriesInput({
        page: req.query.page as string,
        limit: req.query.limit as string,
        status: req.query.status as EnquiryStatus,
      });

      const data = await enquiryService.getEnquiries(page, limit, status);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getEnquiryById(req: Request |any, res: Response) {
    try {
      const enquiry = await enquiryService.getEnquiryById(req.params.id);
      return res.status(200).json({ success: true, data: enquiry });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  static async updateStatus(req: Request |any, res: Response) {
    try {
      const { status } = req.body;
      const updated = await enquiryService.updateEnquiryStatus(req.params.id, status);
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}