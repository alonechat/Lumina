import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try local auth first (x-local-auth-token header)
  const localToken = opts.req.headers.get("x-local-auth-token");
  if (localToken) {
    try {
      const userId = await verifyLocalToken(localToken);
      if (userId) {
        const db = getDb();
        const rows = db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .all();
        if (rows.length > 0) {
          ctx.user = rows[0];
          return ctx;
        }
      }
    } catch {
      // Local auth failed, try OAuth
    }
  }

  // Fall back to OAuth
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional
  }

  return ctx;
}
