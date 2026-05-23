import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";

// ─── Users (local auth + optional OAuth) ────────────────────
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  // Local auth fields
  username: text("username").unique(),
  passwordHash: text("passwordHash"),
  // OAuth fields (optional)
  unionId: text("unionId").unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Folders ──────────────────────────────────────────────────
export const folders = sqliteTable("folders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentId: integer("parentId", { mode: "number" }),
  userId: integer("userId", { mode: "number" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

// ─── Notes ────────────────────────────────────────────────────
export const notes = sqliteTable("notes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  folderId: integer("folderId", { mode: "number" }),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  linksTo: text("linksTo", { mode: "json" }).$type<string[]>(),
  isPinned: integer("isPinned", { mode: "boolean" }).default(false).notNull(),
  isFavorite: integer("isFavorite", { mode: "boolean" }).default(false).notNull(),
  userId: integer("userId", { mode: "number" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// ─── Diaries ──────────────────────────────────────────────────
export const diaries = sqliteTable("diaries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  content: text("content"),
  mood: text("mood"),
  weather: text("weather"),
  isLocked: integer("isLocked", { mode: "boolean" }).default(false).notNull(),
  userId: integer("userId", { mode: "number" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Diary = typeof diaries.$inferSelect;
export type InsertDiary = typeof diaries.$inferInsert;

// ─── Quotes (for daily quotes) ────────────────────────────────
export const quotes = sqliteTable("quotes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  author: text("author"),
  category: text("category"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
