import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// Use a fixed secret for local auth (in production, use env var)
const JWT_SECRET = new TextEncoder().encode(
  process.env.LOCAL_AUTH_SECRET || "lumina-glass-local-auth-secret-key-2026"
);

async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload.sub ? parseInt(payload.sub, 10) : null;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if username exists
      const existing = db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1)
        .all();

      if (existing.length > 0) {
        return { success: false, error: "Username already taken" };
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const result = db
        .insert(users)
        .values({
          username: input.username,
          passwordHash,
          name: input.username,
          role: "user",
        })
        .returning({ id: users.id })
        .all();

      const userId = result[0].id;
      const token = await createToken(userId);

      return { success: true, token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const rows = db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1)
        .all();

      if (rows.length === 0) {
        return { success: false, error: "Invalid username or password" };
      }

      const user = rows[0];
      if (!user.passwordHash) {
        return { success: false, error: "Invalid username or password" };
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        return { success: false, error: "Invalid username or password" };
      }

      // Update last sign in
      db.update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id))
        .run();

      const token = await createToken(user.id);

      return { success: true, token, userId: user.id };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const req = ctx.req;
    const authHeader = req.headers.get("x-local-auth-token");

    if (!authHeader) {
      return null;
    }

    const userId = await verifyLocalToken(authHeader);
    if (!userId) {
      return null;
    }

    const db = getDb();
    const rows = db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .all();

    return rows[0] ?? null;
  }),
});
