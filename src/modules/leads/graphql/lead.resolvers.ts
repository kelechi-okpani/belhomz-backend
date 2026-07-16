import { leadService } from "../services/lead.service";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireAuth, requireRoles } from "../../../shared/graphql/guards";
import { UserRole } from "../../users/interfaces/user.interface";
import { LeadStage } from "../interfaces/lead.interface";
import {
  createLeadSchema,
  addActivitySchema,
  scheduleInspectionSchema,
  updateLeadSchema,
} from "../validators/lead.validator";

export const leadResolvers = {
  Query: {
    leads: async (_: unknown, args: { filter?: { assignedAgent?: string; stage?: LeadStage } }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const filter = args.filter ?? {};
      // Agents and staff only ever see their own leads, regardless of what filter they pass
      if (user.role === UserRole.AGENT || user.role === UserRole.STAFF) filter.assignedAgent = user.id;
      return leadService.list(filter);
    },
    lead: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return leadService.getById(args.id);
    },
    salesFunnel: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER,);
      return leadService.salesFunnel();
    },
    todaysLeadCount: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return leadService.todaysLeadCount();
    },
    topAgents: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER);
      return leadService.topAgents();
    },
    myPerformance: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireRoles(ctx, UserRole.AGENT, UserRole.STAFF);
      return leadService.myPerformance(user.id);
    },
    allAgentPerformance: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER);
      return leadService.allAgentPerformance();
    },
  },
  Mutation: {
    createLead: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const actor = requireRoles(ctx, UserRole.OWNER, UserRole.AGENT, UserRole.STAFF);
      const input = createLeadSchema.parse(args.input);
      return leadService.create(input, actor.id);
    },
    updateLead: async (_: unknown, args: { id: string; input: unknown }, ctx: GraphQLContext) => {
      const actor = requireRoles(ctx, UserRole.OWNER, UserRole.AGENT, UserRole.STAFF);
      const input = updateLeadSchema.parse(args.input);
      return leadService.update(args.id, input, actor.id);
    },
    updateLeadStage: async (
      _: unknown,
      args: { id: string; stage: LeadStage },
      ctx: GraphQLContext
    ) => {
      const actor = requireRoles(ctx, UserRole.OWNER, UserRole.AGENT, UserRole.STAFF);
      return leadService.updateStage(args.id, args.stage, actor.id);
    },
    reassignLead: async (
      _: unknown,
      args: { id: string; agentId: string },
      ctx: GraphQLContext
    ) => {
      const actor = requireRoles(ctx, UserRole.OWNER);
      return leadService.reassign(args.id, args.agentId, actor.id);
    },
    addLeadActivity: async (
      _: unknown,
      args: { id: string; note: string },
      ctx: GraphQLContext
    ) => {
      const user = requireRoles(ctx, UserRole.OWNER, UserRole.AGENT, UserRole.STAFF);
      const { note } = addActivitySchema.parse({ note: args.note });
      return leadService.addActivity(args.id, note, user.id);
    },
    scheduleInspection: async (
      _: unknown,
      args: { id: string; input: unknown },
      ctx: GraphQLContext
    ) => {
      const actor = requireRoles(ctx, UserRole.OWNER, UserRole.AGENT, UserRole.STAFF);
      const input = scheduleInspectionSchema.parse(args.input);
      return leadService.scheduleInspection(
        args.id,
        { ...input, scheduledAt: new Date(input.scheduledAt) },
        actor.id
      );
    },
  },
};