import { paymentService } from "../services/payment.service";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireRoles } from "../../../shared/graphql/guards";
import { UserRole } from "../../users/interfaces/user.interface";
import { createPaymentSchema } from "../validators/payment.validator";

export const paymentResolvers = {
  Query: {
    payments: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, );
      return paymentService.list();
    },
    payment: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, );
      return paymentService.getById(args.id);
    },
    pendingPayments: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, );
      return paymentService.pending();
    },
    overduePayments: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER,);
      return paymentService.overdue();
    },
    monthlyRevenue: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, );
      return paymentService.monthlyRevenue();
    },
    revenueTrend: async (_: unknown, args: { months?: number }, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, );
      return paymentService.revenueTrend(args.months);
    },
  },
  Mutation: {
    createPayment: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = requireRoles(ctx, UserRole.OWNER,);
      const input = createPaymentSchema.parse(args.input);
      return paymentService.create(input, user.id);
    },
    recordInstallmentPayment: async (
      _: unknown,
      args: { paymentId: string; installmentId: string; amount: number },
      ctx: GraphQLContext
    ) => {
      const actor = requireRoles(ctx, UserRole.OWNER,);
      return paymentService.recordInstallmentPayment(
        args.paymentId,
        args.installmentId,
        args.amount,
        actor.id
      );
    },
  },
};