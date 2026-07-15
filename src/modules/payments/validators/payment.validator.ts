import { z } from "zod";
import { PaymentMethod } from "../interfaces/payment.interface";

const installmentInputSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().datetime().or(z.date()),
});

export const createPaymentSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(7),
  property: z.string().min(1),
  lead: z.string().optional(),
  totalAmount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  installments: z.array(installmentInputSchema).min(1),
});

export const recordInstallmentPaymentSchema = z.object({
  paymentId: z.string().min(1),
  installmentId: z.string().min(1),
  amount: z.number().positive(),
});
