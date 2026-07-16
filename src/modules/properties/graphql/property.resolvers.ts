import { propertyService } from "../services/property.service";
import { GraphQLContext } from "../../../shared/graphql/context";
import { requireRoles } from "../../../shared/graphql/guards";
import { UserRole } from "../../users/interfaces/user.interface";
import { PropertyStatus } from "../interfaces/property.interface";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
} from "../validators/property.validator";


export const propertyResolvers = {
  Query: {
    properties: async (_: unknown, args: { filter?: Record<string, unknown> }) => {
      const filter = propertyFilterSchema.parse(args.filter ?? {});
      const { page, limit, ...rest } = filter;
      return propertyService.list(rest, page, limit);
    },
    property: async (_: unknown, args: { id: string }) => {
      return propertyService.getById(args.id);
    },
    propertyAvailability: async () => {
      return propertyService.availabilitySnapshot();
    },
  },


  Mutation: {
    createProperty: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);
      const input = createPropertySchema.parse(args.input);
      return propertyService.create(input, user.id);
    },

    updateProperty: async (
      _: unknown,
      args: { id: string; input: unknown },
      ctx: GraphQLContext
    ) => {
      requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);
      const input = updatePropertySchema.parse(args.input);
      return propertyService.update(args.id, input);
    },

    updatePropertyStatus: async (
      _: unknown,
      args: { id: string; status: PropertyStatus },
      ctx: GraphQLContext
    ) => {
      requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);
      return propertyService.updateStatus(args.id, args.status);
    },
    
    deleteProperty: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRoles(ctx, UserRole.OWNER, UserRole.STAFF);
      await propertyService.delete(args.id);
      return true;
    },
  },
};
