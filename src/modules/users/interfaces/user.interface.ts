export enum UserRole {
  OWNER = "OWNER",
  AGENT = "AGENT",
  STAFF = "STAFF",
  FINANCE = "FINANCE",
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}
