import { z } from "zod";
import { PropertyStatus, PropertyType } from "../interfaces/property.interface";

const imageSchema = z.object({
  url: z.string().url("Must be a valid image URL"),
  publicId: z.string().min(1, "Public ID is required"),
});

export const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  location: z.string().min(2),
  type: z.nativeEnum(PropertyType),
  size: z.number().positive(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(imageSchema).optional().default([]), // Allow images during creation
});

export const updatePropertySchema = createPropertySchema.partial();


export const propertyFilterSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
