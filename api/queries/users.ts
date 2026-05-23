import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const db = getDb();
  const rows = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1)
    .all();
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  // SQLite: check if exists, then update or insert
  const existingRows = getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, values.unionId!))
    .limit(1)
    .all();

  if (existingRows.length > 0) {
    getDb()
      .update(schema.users)
      .set(updateSet)
      .where(eq(schema.users.unionId, values.unionId!))
      .run();
  } else {
    getDb()
      .insert(schema.users)
      .values(values)
      .run();
  }
}
