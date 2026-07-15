import { Request, Response } from "express";
import { catchAsync } from "../../../shared/utils/catchAsync";
import { sendSuccess } from "../../../shared/utils/ApiResponse";
import { ApiError } from "../../../shared/utils/ApiError";
import { authService } from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export const register = catchAsync(async (req: Request | any, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  return sendSuccess(res, 201, result, "Account created successfully");
});

export const login = catchAsync(async (req: Request | any, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  return sendSuccess(res, 200, result, "Logged in successfully");
});

export const refresh = catchAsync(async (req: Request | any, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  const tokens = await authService.refresh(refreshToken);
  return sendSuccess(res, 200, tokens, "Token refreshed successfully");
});

export const logout = catchAsync(async (req: Request | any, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.logout(req.user.id);
  return sendSuccess(res, 200, null, "Logged out successfully");
});

export const forgotPassword = catchAsync(async (req: Request | any, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  // Same response whether or not the email exists — don't reveal account existence
  return sendSuccess(
    res,
    200,
    null,
    "If an account with that email exists, a reset link has been sent"
  );
});

export const resetPassword = catchAsync(async (req: Request | any, res: Response) => {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, newPassword);
  return sendSuccess(res, 200, null, "Password has been reset successfully");
});
