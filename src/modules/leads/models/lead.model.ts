import { Schema, model, Document, Types } from "mongoose";
import { LeadStage } from "../interfaces/lead.interface";

export interface LeadDocument extends Document {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  property?: Types.ObjectId;
  assignedAgent: Types.ObjectId;
  stage: LeadStage;
  activities: { note: string; createdBy: Types.ObjectId; createdAt: Date }[];
  inspection?: {
    scheduledAt: Date;
    location: string;
    notes?: string;
    completed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema(
  {
    note: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const inspectionSchema = new Schema(
  {
    scheduledAt: { type: Date, required: true },
    location: { type: String, required: true },
    notes: { type: String },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const leadSchema = new Schema<LeadDocument>(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    clientEmail: { type: String, trim: true, lowercase: true },
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stage: { type: String, enum: Object.values(LeadStage), default: LeadStage.NEW },
    activities: [activitySchema],
    inspection: inspectionSchema,
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

leadSchema.index({ assignedAgent: 1, stage: 1 });
leadSchema.index({ createdAt: -1 });

export const LeadModel = model<LeadDocument>("Lead", leadSchema);
