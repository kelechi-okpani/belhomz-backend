import { Request } from "express";
import { tryAuthenticate } from "../middlewares/auth";

export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  requestMeta: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export async function buildContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const user = tryAuthenticate(req);
  return {
    user,
    requestMeta: {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  };
}