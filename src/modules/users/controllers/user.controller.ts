import { Request, Response } from "express";
import { catchAsync } from "../../../shared/utils/catchAsync";
import { sendSuccess } from "../../../shared/utils/ApiResponse";
import { ApiError } from "../../../shared/utils/ApiError";
import { userService } from "../services/user.service";
import { updateProfileSchema, changeRoleSchema } from "../validators/user.validator";

export const listStaff = catchAsync(async (_req: Request | any, res: Response) => {
  const staff = await userService.listStaff();
  return sendSuccess(res, 200, staff);
});

export const getUser = catchAsync(async (req: Request | any, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await userService.getById(id);
  return sendSuccess(res, 200, user);
});

export const getMe = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await userService.getById(req.user.id);
  return sendSuccess(res, 200, user);
});

export const updateProfile = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(req.user.id, input);
  return sendSuccess(res, 200, user, "Profile updated");
});

export const changeUserRole = catchAsync(async (req: Request | any, res: Response) => {
  const { role } = changeRoleSchema.parse(req.body);
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await userService.changeRole(id, role, req.user?.id);
  return sendSuccess(res, 200, user, "Role updated");
});

export const deactivateUser = catchAsync(async (req: Request | any, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await userService.deactivate(id, req.user?.id);
  return sendSuccess(res, 200, user, "User deactivated");
});

export const reactivateUser = catchAsync(async (req: Request | any, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await userService.reactivate(id, req.user?.id);
  return sendSuccess(res, 200, user, "User reactivated");
});