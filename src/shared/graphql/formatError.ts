import { GraphQLFormattedError, GraphQLError } from "graphql";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../../config/logger";
import { env } from "../../config/env";

export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  const original = (error as GraphQLError)?.originalError ?? error;

  if (original instanceof ApiError) {
    return {
      message: original.message,
      extensions: {
        code: statusToCode(original.statusCode),
        statusCode: original.statusCode,
        ...(original.details ? { details: original.details } : {}),
      },
    };
  }

  if (original instanceof ZodError) {
    return {
      message: "Validation failed",
      extensions: {
        code: "BAD_USER_INPUT",
        statusCode: 400,
        details: original.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
      },
    };
  }

  // Anything unexpected — log the real error server-side, but never leak
  // internals (stack traces, DB details, etc.) to the client in production.
  logger.error(`Unhandled GraphQL error: ${formattedError.message}`);

  if (env.isProduction) {
    return {
      message: "Internal server error",
      extensions: { code: "INTERNAL_SERVER_ERROR", statusCode: 500 },
    };
  }

  return formattedError;
}

function statusToCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_USER_INPUT";
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
