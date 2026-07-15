import { userService } from "../services/user.service";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireAuth, requireRoles } from "../../../shared/graphql/guards";
import { UserRole } from "../interfaces/user.interface";
import { updateProfileSchema, changeRoleSchema } from "../validators/user.validator";

export const userResolvers = {
  Query: {
    staff: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER);
      return userService.listStaff();
    },
    user: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER);
      return userService.getById(args.id);
    },
    profile: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireAuth(ctx);
      return userService.getById(authUser.id);
    },
  },
  Mutation: {
    updateProfile: async (
      _: unknown,
      args: { input: { name?: string; phone?: string } },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const input = updateProfileSchema.parse(args.input);
      return userService.updateProfile(user.id, input);
    },
    changeUserRole: async (
      _: unknown,
      args: { id: string; role: UserRole },
      ctx: GraphQLContext
    ) => {
      const actor = requireRoles(ctx, UserRole.OWNER);
      const { role } = changeRoleSchema.parse({ role: args.role });
      return userService.changeRole(args.id, role, actor.id);
    },
    deactivateUser: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const actor = requireRoles(ctx, UserRole.OWNER);
      return userService.deactivate(args.id, actor.id);
    },
    reactivateUser: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const actor = requireRoles(ctx, UserRole.OWNER);
      return userService.reactivate(args.id, actor.id);
    },
  },
};