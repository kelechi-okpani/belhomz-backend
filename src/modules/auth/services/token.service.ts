import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../../config/env";
import { redis } from "../../../config/redis";
import { ApiError } from "../../../shared/utils/ApiError";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  AuthTokens,
} from "../interfaces/auth.interface";

const REFRESH_TOKEN_PREFIX = "refresh_token:";

function refreshTokenKey(userId: string, tokenId: string) {
  return `${REFRESH_TOKEN_PREFIX}${userId}:${tokenId}`;
}

export class TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn,
    } as jwt.SignOptions);
  }

  async signRefreshToken(userId: string): Promise<string> {
    const tokenId = crypto.randomUUID();
    const payload: RefreshTokenPayload & { jti: string } = {
      sub: userId,
      tokenVersion: 1,
      jti: tokenId,
    };

    const token = jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    // Store the token id in Redis so it can be individually revoked (logout)
    const ttlSeconds = this.parseExpiryToSeconds(env.jwt.refreshExpiresIn);
    await redis.set(refreshTokenKey(userId, tokenId), "valid", "EX", ttlSeconds);

    return token;
  }

  async issueTokenPair(payload: AccessTokenPayload): Promise<AuthTokens> {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload.sub);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired access token");
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload & { jti: string }> {
    let decoded: RefreshTokenPayload & { jti: string };
    try {
      decoded = jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload & { jti: string };
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const exists = await redis.get(refreshTokenKey(decoded.sub, decoded.jti));
    if (!exists) {
      throw ApiError.unauthorized("Refresh token has been revoked");
    }

    return decoded;
  }

  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    await redis.del(refreshTokenKey(userId, tokenId));
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    const keys = await redis.keys(`${REFRESH_TOKEN_PREFIX}${userId}:*`);
    if (keys.length) await redis.del(...keys);
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60; // default 30 days
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }
}

export const tokenService = new TokenService();
