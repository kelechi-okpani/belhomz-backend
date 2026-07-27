import { Enquiry, IEnquiry, EnquiryStatus } from '../models/enquiry.model';

export class EnquiryRepository {
  async create(data: Partial<IEnquiry>): Promise<IEnquiry> {
    return await Enquiry.create(data);
  }

  async findEnquiries(
    filter: Record<string, any> = {},
    limit: number = 10,
    skip: number = 0
  ): Promise<IEnquiry[]> {
    return await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IEnquiry[]>();
  }

  async countEnquiries(filter: Record<string, any> = {}): Promise<number> {
    return await Enquiry.countDocuments(filter);
  }

  async findById(id: string): Promise<IEnquiry | null> {
    return await Enquiry.findById(id).lean<IEnquiry>();
  }

  async updateStatus(id: string, status: EnquiryStatus): Promise<IEnquiry | null> {
    return await Enquiry.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean<IEnquiry>();
  }
}