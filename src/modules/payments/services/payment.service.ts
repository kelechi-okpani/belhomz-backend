import { paymentRepository } from "../repositories/payment.repository";
import { ApiError } from "../../../shared/utils/ApiError";
import { activityFeedService } from "../../../shared/activity/services/activity.service";
import { ActivityType } from "../../../shared/activity/models/activity.model";

export class PaymentService {
  async create(data: Record<string, unknown>, recordedBy: string) {
    const payment = await paymentRepository.create({ ...data, recordedBy } as any);
    await activityFeedService.record({
      type: ActivityType.PAYMENT_CREATED,
      message: `Payment plan created for ${payment.clientName} (₦${payment.totalAmount.toLocaleString()})`,
      entityType: "Payment",
      entityId: payment._id.toString(),
      actor: recordedBy,
    });
    return payment;
  }

  async getById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw ApiError.notFound("Payment record not found");
    return payment;
  }

  async list() {
    return paymentRepository.findAll();
  }

  async recordInstallmentPayment(
    paymentId: string,
    installmentId: string,
    amount: number,
    actor?: string
  ) {
    const payment = await paymentRepository.recordInstallmentPayment(
      paymentId,
      installmentId,
      amount
    );
    if (!payment) throw ApiError.notFound("Payment or installment not found");
    await activityFeedService.record({
      type: ActivityType.INSTALLMENT_PAID,
      message: `Payment of ₦${amount.toLocaleString()} recorded for ${payment.clientName}`,
      entityType: "Payment",
      entityId: payment._id.toString(),
      actor,
    });
    return payment;
  }

  async pending() {
    return paymentRepository.findPending();
  }

  async overdue() {
    return paymentRepository.findOverdue();
  }

  async monthlyRevenue() {
    return paymentRepository.monthlyRevenue();
  }

  async revenueTrend(months?: number) {
    return paymentRepository.revenueTrend(months);
  }

  async refreshOverdueStatuses() {
    await paymentRepository.markOverdue();
  }
}

export const paymentService = new PaymentService();