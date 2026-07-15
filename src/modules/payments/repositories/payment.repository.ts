import { PaymentModel, PaymentDocument } from "../models/payment.model";
import { PaymentStatus } from "../interfaces/payment.interface";

export class PaymentRepository {
  async create(data: Partial<PaymentDocument>): Promise<PaymentDocument> {
    return PaymentModel.create(data);
  }

  async findById(id: string): Promise<PaymentDocument | null> {
    return PaymentModel.findById(id).exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<PaymentDocument[]> {
    return PaymentModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async recordInstallmentPayment(
    paymentId: string,
    installmentId: string,
    amount: number
  ): Promise<PaymentDocument | null> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) return null;

    const installment = payment.installments.id(installmentId);
    if (!installment) return null;

    installment.status = PaymentStatus.PAID;
    installment.paidAt = new Date();
    payment.amountPaid += amount;

    await payment.save();
    return payment;
  }

  async findOverdue(): Promise<PaymentDocument[]> {
    return PaymentModel.find({
      "installments.status": PaymentStatus.PENDING,
      "installments.dueDate": { $lt: new Date() },
    }).exec();
  }

  async findPending(): Promise<PaymentDocument[]> {
    return PaymentModel.find({ "installments.status": PaymentStatus.PENDING }).exec();
  }

  async monthlyRevenue(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await PaymentModel.aggregate([
      { $unwind: "$installments" },
      {
        $match: {
          "installments.status": PaymentStatus.PAID,
          "installments.paidAt": { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$installments.amount" } } },
    ]);

    return result[0]?.total ?? 0;
  }

  /**
   * Revenue for each of the last `months` calendar months (oldest first),
   * for the Owner's revenue trend chart.
   */
  async revenueTrend(months = 6): Promise<{ month: string; total: number }[]> {
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const results = await PaymentModel.aggregate([
      { $unwind: "$installments" },
      {
        $match: {
          "installments.status": PaymentStatus.PAID,
          "installments.paidAt": { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$installments.paidAt" },
            month: { $month: "$installments.paidAt" },
          },
          total: { $sum: "$installments.amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill in months with zero revenue so the chart doesn't skip gaps
    const byKey = new Map(
      results.map((r) => [`${r._id.year}-${r._id.month}`, r.total as number])
    );

    const trend: { month: string; total: number }[] = [];
    const cursor = new Date(start);
    for (let i = 0; i < months; i++) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      trend.push({
        month: cursor.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        total: byKey.get(key) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return trend;
  }

  async markOverdue(): Promise<void> {
    await PaymentModel.updateMany(
      {
        "installments.status": PaymentStatus.PENDING,
        "installments.dueDate": { $lt: new Date() },
      },
      { $set: { "installments.$[elem].status": PaymentStatus.OVERDUE } },
      {
        arrayFilters: [
          { "elem.status": PaymentStatus.PENDING, "elem.dueDate": { $lt: new Date() } },
        ],
      }
    );
  }
}

export const paymentRepository = new PaymentRepository();