export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  LAND = "LAND",
  COMMERCIAL = "COMMERCIAL",
  DUPLEX = "DUPLEX",
}

export interface PropertyImage {
  url: string;
  publicId: string;
}

export interface IProperty {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: PropertyType;
  size: number; // in square meters
  amenities: string[];
  status: PropertyStatus;
  images: PropertyImage[];
  createdBy: string; // user id
  createdAt: Date;
  updatedAt: Date;
}
