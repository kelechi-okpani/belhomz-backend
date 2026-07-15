import { Request, Response, NextFunction } from "express";
import { tokenService } from "../../modules/auth/services/token.service";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../../modules/users/interfaces/user.interface";

export interface AuthUser {
  
  // user: {
  //       id: string;
  //       role: UserRole;
  //       email: string;
  //     };
  id: string;
  email: string;
  role: UserRole;
}

export function authenticate(req: Request | any, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Authentication token missing"));
  }

  const token = header.split(" ")[1];
  try {
    const payload = tokenService.verifyAccessToken(token);
    // ✅ No longer throws TS2339 error
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request | any, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}

// Non-throwing variant used in the GraphQL context
export function tryAuthenticate(req: Request): AuthUser | undefined {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return undefined;
  try {
    const payload = tokenService.verifyAccessToken(header.split(" ")[1]);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return undefined;
  }
}