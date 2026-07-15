import { ApiError } from "../utils/ApiError";
import { GraphQLContext } from "./context";
import { UserRole } from "../../modules/users/interfaces/user.interface";

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) throw ApiError.unauthorized("You must be logged in");
  return ctx.user;
}

export function requireRoles(ctx: GraphQLContext, ...roles: UserRole[]) {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role as UserRole)) {
    throw ApiError.forbidden("You do not have permission to perform this action");
  }
  return user;
}
