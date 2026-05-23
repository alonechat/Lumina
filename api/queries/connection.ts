import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@db/schema";

let instance: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!instance) {
    const dbPath = process.env.DATABASE_URL?.replace("sqlite://", "") || "./local.db";
    const client = new Database(dbPath);
    // Enable WAL mode for better performance
    client.pragma("journal_mode = WAL");
    instance = drizzle(client, { schema });
  }
  return instance;
}
