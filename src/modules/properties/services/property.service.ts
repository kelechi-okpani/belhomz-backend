import { propertyRepository, PropertyFilter } from "../repositories/property.repository";
import { ApiError } from "../../../shared/utils/ApiError";
import { PropertyStatus } from "../interfaces/property.interface";
import { deleteFromCloudinary } from "../../../config/cloudinary";

export class PropertyService {
  async create(data: Record<string, unknown>, createdBy: string) {
    return propertyRepository.create({ ...data, createdBy } as any);
  }

  async getById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw ApiError.notFound("Property not found");
    return property;
  }

  async list(filter: PropertyFilter, page: number, limit: number) {
    return propertyRepository.find(filter, page, limit);
  }

  async update(id: string, data: Record<string, unknown>) {
    const property = await propertyRepository.update(id, data as any);
    if (!property) throw ApiError.notFound("Property not found");
    return property;
  }

  async updateStatus(id: string, status: PropertyStatus) {
    const property = await propertyRepository.updateStatus(id, status);
    if (!property) throw ApiError.notFound("Property not found");
    return property;
  }

  async removeImage(id: string, publicId: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw ApiError.notFound("Property not found");

    await deleteFromCloudinary(publicId).catch(() => undefined);
    return propertyRepository.removeImage(id, publicId);
  }

  async delete(id: string) {
    const property = await propertyRepository.delete(id);
    if (!property) throw ApiError.notFound("Property not found");

    await Promise.all(
      property.images.map((img) => deleteFromCloudinary(img.publicId).catch(() => undefined))
    );
    return property;
  }

  // Accepts optional userId to scope counts to properties managed/created by that user
  async availabilitySnapshot(userId?: string) {
    const [available, reserved, sold] = await Promise.all([
      propertyRepository.countByStatus(PropertyStatus.AVAILABLE, userId),
      propertyRepository.countByStatus(PropertyStatus.RESERVED, userId),
      propertyRepository.countByStatus(PropertyStatus.SOLD, userId),
    ]);
    return { available, reserved, sold };
  }
}

export const propertyService = new PropertyService();