import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { notesRouter, foldersRouter } from "./notes-router";
import { diariesRouter, quotesRouter } from "./diaries-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  notes: notesRouter,
  folders: foldersRouter,
  diaries: diariesRouter,
  quotes: quotesRouter,
});

export type AppRouter = typeof appRouter;
