import { UserRole } from "../../users/interfaces/user.interface";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}

// export interface RefreshTokenPayload {
//   sub: string;
//   tokenVersion: number;
// }

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  sessionStart: number; // epoch ms — when this login session began, never resets on refresh
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}
