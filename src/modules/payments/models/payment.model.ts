import { Schema, model, Document, Types } from "mongoose";
import { PaymentStatus, PaymentMethod } from "../interfaces/payment.interface";

export interface InstallmentSubdocument extends Types.Subdocument {
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface PaymentDocument extends Document {
  clientName: string;
  clientPhone: string;
  property: Types.ObjectId;
  lead?: Types.ObjectId;
  totalAmount: number;
  amountPaid: number;
  method: PaymentMethod;
  installments: Types.DocumentArray<InstallmentSubdocument>;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const installmentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paidAt: { type: Date },
  },
  { _id: true }
);

const paymentSchema = new Schema<PaymentDocument>(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    installments: [installmentSchema],
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ property: 1 });
paymentSchema.index({ "installments.status": 1, "installments.dueDate": 1 });

export const PaymentModel = model<PaymentDocument>("Payment", paymentSchema);
