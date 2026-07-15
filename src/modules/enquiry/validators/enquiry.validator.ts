import { EnquiryStatus } from '../models/enquiry.model';

export interface CreateEnquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface GetEnquiriesQueryInput {
  page?: number | string;
  limit?: number | string;
  status?: EnquiryStatus;
}

export const validateCreateEnquiryInput = (input: CreateEnquiryInput) => {
  const { fullName, email, subject, message } = input;

  if (!fullName || !fullName.trim()) throw new Error('Full name is required');
  if (!email || !/\S+@\S+\.\S+/.test(email)) throw new Error('A valid email address is required');
  if (!subject || !subject.trim()) throw new Error('Subject is required');
  if (!message || !message.trim()) throw new Error('Message content is required');

  return {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    subject: subject.trim(),
    message: message.trim(),
  };
};

export const validateGetEnquiriesInput = (input: GetEnquiriesQueryInput) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(input.limit) || 10));
  const status = Object.values(EnquiryStatus).includes(input.status as EnquiryStatus)
    ? input.status
    : undefined;

  return { page, limit, status };
};