import { z } from "zod";
import { UserRole } from "../interfaces/user.interface";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export const changeRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User id is required"),
});