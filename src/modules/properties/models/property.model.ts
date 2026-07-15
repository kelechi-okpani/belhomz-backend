import { Schema, model, Document, Types } from "mongoose";
import { IProperty, PropertyStatus, PropertyType } from "../interfaces/property.interface";

export interface PropertyDocument extends Omit<IProperty, "_id" | "createdBy">, Document {
  createdBy: Types.ObjectId;
}

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const propertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(PropertyType), required: true },
    size: { type: Number, required: true, min: 0 },
    amenities: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: Object.values(PropertyStatus),
      default: PropertyStatus.AVAILABLE,
    },
    images: [imageSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

propertySchema.index({ status: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ title: "text", description: "text" });

export const PropertyModel = model<PropertyDocument>("Property", propertySchema);
