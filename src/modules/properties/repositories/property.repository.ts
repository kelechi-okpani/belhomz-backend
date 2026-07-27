import { PropertyModel, PropertyDocument } from "../models/property.model";
import { PropertyStatus } from "../interfaces/property.interface";

export interface PropertyFilter {
  status?: PropertyStatus;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export class PropertyRepository {
  async create(data: Partial<PropertyDocument>): Promise<PropertyDocument> {
    return PropertyModel.create(data);
  }

  async findById(id: string): Promise<PropertyDocument | null> {
    return PropertyModel.findById(id).exec();
  }

  async find(filter: PropertyFilter, page = 1, limit = 20): Promise<{ items: PropertyDocument[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.status) query.status = filter.status;
    if (filter.location) query.location = { $regex: filter.location, $options: "i" };
    if (filter.minPrice || filter.maxPrice) {
      query.price = {
        ...(filter.minPrice ? { $gte: filter.minPrice } : {}),
        ...(filter.maxPrice ? { $lte: filter.maxPrice } : {}),
      };
    }
    if (filter.search) query.$text = { $search: filter.search };

    const [items, total] = await Promise.all([
      PropertyModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      PropertyModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async update(id: string, data: Partial<PropertyDocument>): Promise<PropertyDocument | null> {
    return PropertyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id: string, status: PropertyStatus): Promise<PropertyDocument | null> {
    return PropertyModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async addImage(id: string, image: { url: string; publicId: string }): Promise<PropertyDocument | null> {
    return PropertyModel.findByIdAndUpdate(
      id,
      { $push: { images: image } },
      { new: true }
    ).exec();
  }

  async removeImage(id: string, publicId: string): Promise<PropertyDocument | null> {
    return PropertyModel.findByIdAndUpdate(
      id,
      { $pull: { images: { publicId } } },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<PropertyDocument | null> {
    return PropertyModel.findByIdAndDelete(id).exec();
  }

  // Accepts optional userId to filter count by the creator/owner
  async countByStatus(status: PropertyStatus, userId?: string): Promise<number> {
    const query: Record<string, unknown> = { status };
    if (userId) {
      query.createdBy = userId;
    }
    return PropertyModel.countDocuments(query);
  }
}

export const propertyRepository = new PropertyRepository();