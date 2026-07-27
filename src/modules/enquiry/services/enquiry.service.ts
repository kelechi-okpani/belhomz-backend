import { EnquiryRepository } from '../repositories/enquiry.repository';
import { EnquiryStatus } from '../models/enquiry.model';
import {
  CreateEnquiryInput,
  validateCreateEnquiryInput,
} from '../validators/enquiry.validator';

export class EnquiryService {
  private repo: EnquiryRepository;

  constructor() {
    this.repo = new EnquiryRepository();
  }

  async createEnquiry(rawInput: CreateEnquiryInput) {
    const validatedData = validateCreateEnquiryInput(rawInput);
    return await this.repo.create(validatedData);
  }

  async getEnquiries(page: number = 1, limit: number = 10, status?: EnquiryStatus) {
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [enquiries, total] = await Promise.all([
      this.repo.findEnquiries(filter, limit, skip),
      this.repo.countEnquiries(filter),
    ]);

    return {
      enquiries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getEnquiryById(id: string) {
    const enquiry = await this.repo.findById(id);
    if (!enquiry) {
      throw new Error('Customer enquiry not found');
    }
    return enquiry;
  }

  async updateEnquiryStatus(id: string, status: EnquiryStatus) {
    const updated = await this.repo.updateStatus(id, status);
    if (!updated) {
      throw new Error('Customer enquiry not found or update failed');
    }
    return updated;
  }
}