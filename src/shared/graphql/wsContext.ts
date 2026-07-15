import { tokenService } from "../../modules/auth/services/token.service";
import { GraphQLContext } from "./context";

/**
 * Builds context for WebSocket (subscription) connections. Unlike HTTP
 * requests, there's no Express `req` here — the client sends its token
 * via `connectionParams` when it opens the socket instead of a header.
 */
export function buildWsContext(connectionParams: Record<string, unknown>): GraphQLContext {
  const authHeader =
    (connectionParams?.authorization as string | undefined) ??
    (connectionParams?.Authorization as string | undefined);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: undefined, requestMeta: {} };
  }

  try {
    const payload = tokenService.verifyAccessToken(authHeader.split(" ")[1]);
    return {
      user: { id: payload.sub, email: payload.email, role: payload.role },
      requestMeta: {},
    };
  } catch {
    return { user: undefined, requestMeta: {} };
  }
}
