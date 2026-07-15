import crypto from "node:crypto";
import { userRepository } from "../../users/repositories/user.repository";
import { tokenService } from "./token.service";
import { ApiError } from "../../../shared/utils/ApiError";
import { RegisterInput, LoginInput, AuthTokens } from "../interfaces/auth.interface";
import { IUserPublic } from "../../users/interfaces/user.interface";
import { UserDocument } from "../../users/models/user.model";
import { LoginAuditModel, LoginAuditStatus } from "../models/loginAudit.model";
import { redis } from "../../../config/redis";
import { sendEmail } from "../../../config/email";
import { env } from "../../../config/env";
import { activityFeedService } from "../../../shared/activity/services/activity.service";
import { ActivityType } from "../../../shared/activity/models/activity.model";

const RESET_TOKEN_PREFIX = "password_reset:";
const RESET_TOKEN_TTL_SECONDS = 30 * 60; // 30 minutes

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toPublicUser(user: UserDocument): IUserPublic {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
  };
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUserPublic; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const user = await userRepository.create(input);
    await activityFeedService.record({
      type: ActivityType.STAFF_ACCOUNT_CREATED,
      message: `${user.name} joined as ${user.role.toLowerCase()}`,
      entityType: "User",
      entityId: user._id.toString(),
    });

    const tokens = await tokenService.issueTokenPair({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user: toPublicUser(user), tokens };
  }

  async login(
    input: LoginInput,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: IUserPublic; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email, true);

    if (!user) {
      await LoginAuditModel.create({
        email: input.email,
        status: LoginAuditStatus.FAILED,
        ...meta,
      });
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      await LoginAuditModel.create({
        user: user._id,
        email: input.email,
        status: LoginAuditStatus.FAILED,
        ...meta,
      });
      throw ApiError.forbidden("This account has been deactivated");
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      await LoginAuditModel.create({
        user: user._id,
        email: input.email,
        status: LoginAuditStatus.FAILED,
        ...meta,
      });
      throw ApiError.unauthorized("Invalid email or password");
    }

    await LoginAuditModel.create({
      user: user._id,
      email: input.email,
      status: LoginAuditStatus.SUCCESS,
      ...meta,
    });

    const tokens = await tokenService.issueTokenPair({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user: toPublicUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(decoded.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account no longer active");
    }

    // Rotate: revoke the old refresh token, issue a fresh pair
    await tokenService.revokeRefreshToken(decoded.sub, decoded.jti);
    return tokenService.issueTokenPair({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }

  async logout(userId: string): Promise<void> {
    await tokenService.revokeAllRefreshTokens(userId);
  }

  /**
   * Always resolves successfully regardless of whether the email exists —
   * this prevents leaking which emails are registered (a common security
   * requirement for "forgot password" flows).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // silently no-op, do not reveal account existence

    const rawToken = crypto.randomBytes(32).toString("hex");
    const key = `${RESET_TOKEN_PREFIX}${hashToken(rawToken)}`;
    await redis.set(key, user._id.toString(), "EX", RESET_TOKEN_TTL_SECONDS);

    const resetUrl = `${env.CLIENT_RESET_PASSWORD_URL}?token=${rawToken}`;

await sendEmail({
  to: user.email,
  subject: "Reset your Belhomz password",
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header / Logo -->
        <tr>
          <td style="padding: 40px 40px 0 40px; text-align: center;">
            <span style="font-size: 24px; font-weight: 800; color: #1f2937; letter-spacing: -0.025em;">Belhomz</span>
          </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
          <td style="padding: 32px 40px 40px 40px;">
            <p style="font-size: 16px; line-height: 24px; color: #1f2937; font-weight: 600; margin: 0 0 16px 0;">
              Hi ${user.name},
            </p>
            <p style="font-size: 15px; line-height: 24px; color: #4b5563; margin: 0 0 32px 0;">
              We received a request to reset your password for your Belhomz account. Click the button below to choose a new one. This link will expire in <strong style="color: #111827;">30 minutes</strong>.
            </p>
            
            <!-- Button CTA -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
              <tr>
                <td align="center" style="background-color: #2563eb; border-radius: 6px;">
                  <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; line-height: 22px; color: #6b7280; margin: 0 0 24px 0;">
              If you didn't request this change, you can safely ignore this email—your password will remain completely secure.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />
            
            <!-- Subtext / Fallback Link -->
            <p style="font-size: 12px; line-height: 18px; color: #9ca3af; margin: 0 0 8px 0;">
              If you're having trouble clicking the button, copy and paste the URL below into your web browser:
            </p>
            <p style="font-size: 12px; line-height: 18px; margin: 0; word-break: break-all;">
              <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
            </p>
          </td>
        </tr>
        
      </table>
      
      <!-- Footer -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px; margin-top: 24px;">
        <tr>
          <td style="text-align: center; font-size: 12px; color: #9ca3af; line-height: 18px;">
            &copy; ${new Date().getFullYear()} RESOS. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `,
});
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const key = `${RESET_TOKEN_PREFIX}${hashToken(token)}`;
    const userId = await redis.get(key);

    if (!userId) {
      throw ApiError.badRequest("This reset link is invalid or has expired");
    }

    // updatePassword helper isn't available on the repository; load the user,
    // set the new password and save so model hooks (e.g. hashing) run.
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Account no longer exists");
    }

    user.password = newPassword as any;
    await user.save();

    // One-time use — remove immediately so the link can't be replayed
    await redis.del(key);

    // Force logout everywhere — a password reset should invalidate any
    // sessions that may have been compromised
    await tokenService.revokeAllRefreshTokens(user._id.toString());
  }
}

export const authService = new AuthService();