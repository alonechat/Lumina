import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { diaries, quotes } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const diariesRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        year: z.number().optional(),
        month: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(diaries.userId, ctx.user.id)];

      if (input?.year && input?.month) {
        const monthStr = String(input.month).padStart(2, "0");
        const yearStr = String(input.year);
        conditions.push(
          sql`strftime('%Y-%m', ${diaries.date}) = ${yearStr + '-' + monthStr}`
        );
      }

      return db
        .select()
        .from(diaries)
        .where(and(...conditions))
        .orderBy(desc(diaries.date))
        .all();
    }),

  getByDate: authedQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const targetDate = new Date(input.date);
      // Normalize to YYYY-MM-DD for reliable comparison
      const dateStr = targetDate.toISOString().split("T")[0];
      const result = db
        .select()
        .from(diaries)
        .where(
          and(
            sql`date(${diaries.date}) = ${dateStr}`,
            eq(diaries.userId, ctx.user.id)
          )
        )
        .limit(1)
        .all();

      return result[0] ?? null;
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = db
        .select()
        .from(diaries)
        .where(and(eq(diaries.id, input.id), eq(diaries.userId, ctx.user.id)))
        .limit(1)
        .all();

      return result[0] ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        date: z.string(),
        content: z.string().optional(),
        mood: z.string().optional(),
        weather: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = db.insert(diaries).values({
        date: new Date(input.date),
        content: input.content ?? "",
        mood: input.mood ?? null,
        weather: input.weather ?? null,
        userId: ctx.user.id,
      }).returning({ id: diaries.id }).all();

      return { id: result[0].id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        content: z.string().optional(),
        mood: z.string().optional(),
        weather: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      db.update(diaries)
        .set(data)
        .where(and(eq(diaries.id, id), eq(diaries.userId, ctx.user.id)))
        .run();

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      db.delete(diaries)
        .where(and(eq(diaries.id, input.id), eq(diaries.userId, ctx.user.id)))
        .run();

      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select({
        count: sql<number>`COUNT(*)`,
        month: sql<string>`strftime('%Y-%m', ${diaries.date})`,
      })
      .from(diaries)
      .where(eq(diaries.userId, ctx.user.id))
      .groupBy(sql`strftime('%Y-%m', ${diaries.date})`)
      .orderBy(desc(sql`strftime('%Y-%m', ${diaries.date})`))
      .all();
  }),
});

// Quotes - public, no auth required
export const quotesRouter = createRouter({
  random: publicQuery.query(async () => {
    const db = getDb();
    const result = db
      .select()
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .all();

    return result[0] ?? {
      id: 0,
      text: "The unexamined life is not worth living.",
      author: "Socrates",
      category: "philosophy",
      createdAt: new Date(),
    };
  }),
});
