import { Request, Response } from "express";
import { catchAsync } from "../../../shared/utils/catchAsync";
import { sendSuccess } from "../../../shared/utils/ApiResponse";
import { ApiError } from "../../../shared/utils/ApiError";
import { paymentService } from "../services/payment.service";
import { createPaymentSchema, recordInstallmentPaymentSchema } from "../validators/payment.validator";

export const createPayment = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createPaymentSchema.parse(req.body);
  const payment = await paymentService.create(input, req.user.id);
  return sendSuccess(res, 201, payment, "Payment record created");
});

export const listPayments = catchAsync(async (_req: Request | any, res: Response) => {
  const payments = await paymentService.list();
  return sendSuccess(res, 200, payments);
});

export const getPayment = catchAsync(async (req: Request | any, res: Response) => {
  const payment = await paymentService.getById(req.params.id);
  return sendSuccess(res, 200, payment);
});

export const recordInstallmentPayment = catchAsync(async (req: Request | any, res: Response) => {
  const { paymentId, installmentId, amount } = recordInstallmentPaymentSchema.parse({
    paymentId: req.params.paymentId,
    installmentId: req.params.installmentId,
    amount: req.body.amount,
  });
  const payment = await paymentService.recordInstallmentPayment(paymentId, installmentId, amount);
  return sendSuccess(res, 200, payment, "Installment payment recorded");
});

export const pendingPayments = catchAsync(async (_req: Request | any, res: Response) => {
  const payments = await paymentService.pending();
  return sendSuccess(res, 200, payments);
});

export const overduePayments = catchAsync(async (_req: Request | any, res: Response) => {
  const payments = await paymentService.overdue();
  return sendSuccess(res, 200, payments);
});

export const monthlyRevenue = catchAsync(async (_req: Request | any, res: Response) => {
  const revenue = await paymentService.monthlyRevenue();
  return sendSuccess(res, 200, { revenue });
});
