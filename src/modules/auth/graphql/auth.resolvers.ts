import { authService } from "../services/auth.service";
import { userRepository } from "../../users/repositories/user.repository";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireAuth } from "../../../shared/graphql/guards";
import { ApiError } from "../../../shared/utils/ApiError";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireAuth(ctx);
      const user = await userRepository.findById(authUser.id);
      if (!user) throw ApiError.notFound("User not found");
      return user;
    },
  },
  Mutation: {
    register: async (_: unknown, args: { input: unknown }) => {
      const input = registerSchema.parse(args.input);
      return authService.register(input);
    },

    login: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const input = loginSchema.parse(args.input);
      return authService.login(input, ctx.requestMeta);
    },

    refreshToken: async (_: unknown, args: { refreshToken: string }) => {
      return authService.refresh(args.refreshToken);
    },

    logout: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      await authService.logout(user.id);
      return true;
    },

    forgotPassword: async (_: unknown, args: { email: string }) => {
      const { email } = forgotPasswordSchema.parse({ email: args.email });
      await authService.forgotPassword(email);
      return true; // always true — never reveal whether the email exists
    },

    resetPassword: async (_: unknown, args: { token: string; newPassword: string }) => {
      const input = resetPasswordSchema.parse(args);
      await authService.resetPassword(input.token, input.newPassword);
      return true;
    },
  },
};
