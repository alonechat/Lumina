import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notes, folders } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const notesRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        folderId: z.number().optional(),
        search: z.string().optional(),
        tag: z.string().optional(),
        favorite: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const conditions = [eq(notes.userId, userId)];

      if (input?.folderId) {
        conditions.push(eq(notes.folderId, input.folderId));
      }

      if (input?.search) {
        conditions.push(
          sql`${notes.title} LIKE ${"%" + input.search + "%"} OR ${notes.content} LIKE ${"%" + input.search + "%"}`
        );
      }

      if (input?.favorite) {
        conditions.push(eq(notes.isFavorite, true));
      }

      const result = db
        .select()
        .from(notes)
        .where(and(...conditions))
        .orderBy(desc(notes.updatedAt))
        .all();

      return result;
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = db
        .select()
        .from(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id)))
        .limit(1)
        .all();

      return result[0] ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        folderId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = db.insert(notes).values({
        title: input.title,
        content: input.content ?? "",
        folderId: input.folderId ?? null,
        tags: input.tags ?? [],
        userId: ctx.user.id,
      }).returning({ id: notes.id }).all();

      return { id: result[0].id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        folderId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        isPinned: z.boolean().optional(),
        isFavorite: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      db.update(notes)
        .set(data)
        .where(and(eq(notes.id, id), eq(notes.userId, ctx.user.id)))
        .run();

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      db.delete(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id)))
        .run();

      return { success: true };
    }),
});

export const foldersRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(folders)
      .where(eq(folders.userId, ctx.user.id))
      .orderBy(folders.name)
      .all();
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = db.insert(folders).values({
        name: input.name,
        parentId: input.parentId ?? null,
        userId: ctx.user.id,
      }).returning({ id: folders.id }).all();

      return { id: result[0].id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      db.delete(folders)
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.user.id)))
        .run();

      return { success: true };
    }),
});
