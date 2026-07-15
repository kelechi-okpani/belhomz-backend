import { Schema, model, Document, Types } from "mongoose";

export enum LoginAuditStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface LoginAuditDocument extends Document {
  user?: Types.ObjectId; // populated only on successful login
  email: string;
  status: LoginAuditStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const loginAuditSchema = new Schema<LoginAuditDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: Object.values(LoginAuditStatus), required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Auto-expire audit records after 90 days — keeps the collection lean
loginAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
loginAuditSchema.index({ email: 1, createdAt: -1 });

export const LoginAuditModel = model<LoginAuditDocument>("LoginAudit", loginAuditSchema);
