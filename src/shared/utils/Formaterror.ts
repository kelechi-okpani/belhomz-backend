import { GraphQLFormattedError, GraphQLError } from "graphql";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../../config/logger";
import { env } from "../../config/env";


export const formatGraphQLError = (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
  // 🚀 FIX: If we are in development, return the locations array so VS Code doesn't crash
  if (process.env.NODE_ENV !== "production") {
    return {
      ...formattedError,
      message: formattedError.message,
      locations: formattedError.locations || [], // Essential for the VS Code extension!
      path: formattedError.path,
    };
  }

  // Your production error masking logic below (e.g., safe messages for users)
  return {
    message: formattedError.message.startsWith("Context creation failed") 
      ? "Authentication error" 
      : formattedError.message,
  };
};

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