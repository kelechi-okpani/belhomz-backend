import { Schema, model, Document, Types } from "mongoose";

export enum ActivityType {
  // Leads
  LEAD_CREATED = "LEAD_CREATED",
  LEAD_STAGE_CHANGED = "LEAD_STAGE_CHANGED",
  LEAD_REASSIGNED = "LEAD_REASSIGNED",
  LEAD_NOTE_ADDED = "LEAD_NOTE_ADDED",
  INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED",

  // Properties
  PROPERTY_CREATED = "PROPERTY_CREATED",
  PROPERTY_UPDATED = "PROPERTY_UPDATED",
  PROPERTY_STATUS_CHANGED = "PROPERTY_STATUS_CHANGED",
  PROPERTY_DELETED = "PROPERTY_DELETED",

  // Payments
  PAYMENT_CREATED = "PAYMENT_CREATED",
  INSTALLMENT_PAID = "INSTALLMENT_PAID",

  // Staff / accounts
  STAFF_ACCOUNT_CREATED = "STAFF_ACCOUNT_CREATED",
  STAFF_ROLE_CHANGED = "STAFF_ROLE_CHANGED",
  STAFF_DEACTIVATED = "STAFF_DEACTIVATED",
  STAFF_REACTIVATED = "STAFF_REACTIVATED",

  CLIENT_ENQUIRY = "CLIENT_ENQUIRY",
}

export interface ActivityDocument extends Document {
  type: ActivityType;
  message: string;
  entityType: string; // "Lead" | "Property" | "Payment"
  entityId: Types.ObjectId;
  actor?: Types.ObjectId;
  createdAt: Date; // Explicitly typed for compiler safety
}

const activitySchema = new Schema<ActivityDocument>(
  {
    type: { type: String, enum: Object.values(ActivityType), required: true },
    message: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    // Generates the createdAt field automatically and maintains Date format
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        // Convert the MongoDB Date object to an ISO string for safe delivery to GraphQL/Frontend
        if (ret.createdAt instanceof Date) {
          ret.createdAt = ret.createdAt.toISOString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Feed is read newest-first; keep history bounded (1 year) so the
// collection doesn't grow unbounded on a long-running deployment.
activitySchema.index({ createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const ActivityModel = model<ActivityDocument>("Activity", activitySchema);