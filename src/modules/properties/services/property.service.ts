import { propertyRepository, PropertyFilter } from "../repositories/property.repository";
import { ApiError } from "../../../shared/utils/ApiError";
import { PropertyStatus } from "../interfaces/property.interface";
import { deleteFromCloudinary } from "../../../config/cloudinary";

export class PropertyService {
  async create(data: Record<string, unknown>, createdBy: string) {
    // Standard payload will now automatically include the "images" array if passed
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
    // If frontend uploads new items and sends complete updated images list,
    // this standard update will overwrite/update the property's images field.
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

    // Clean up Cloudinary asset
    await deleteFromCloudinary(publicId).catch(() => undefined);
    
    // Pull the image out of the Mongo DB array
    return propertyRepository.removeImage(id, publicId);
  }

  async delete(id: string) {
    const property = await propertyRepository.delete(id);
    if (!property) throw ApiError.notFound("Property not found");
    
    // Clean up all associated images from Cloudinary on listing deletion
    await Promise.all(
      property.images.map((img) => deleteFromCloudinary(img.publicId).catch(() => undefined))
    );
    return property;
  }

  async availabilitySnapshot() {
    const [available, reserved, sold] = await Promise.all([
      propertyRepository.countByStatus(PropertyStatus.AVAILABLE),
      propertyRepository.countByStatus(PropertyStatus.RESERVED),
      propertyRepository.countByStatus(PropertyStatus.SOLD),
    ]);
    return { available, reserved, sold };
  }
}

export const propertyService = new PropertyService();