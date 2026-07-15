export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export enum PaymentMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  CARD = "CARD",
  OTHER = "OTHER",
}

export interface IInstallment {
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface IPayment {
  _id: string;
  clientName: string;
  clientPhone: string;
  property: string; // property id
  lead?: string; // originating lead id
  totalAmount: number;
  amountPaid: number;
  method: PaymentMethod;
  installments: IInstallment[];
  recordedBy: string; // user id
  createdAt: Date;
  updatedAt: Date;
}
