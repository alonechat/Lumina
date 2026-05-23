declare module "better-sqlite3" {
  class Database {
    constructor(filename: string, options?: Record<string, unknown>);
    pragma(source: string, options?: { simple?: boolean }): unknown;
    prepare(sql: string): Statement;
    exec(sql: string): this;
    close(): void;
    transaction(fn: (...args: unknown[]) => unknown): (...args: unknown[]) => unknown;
  }
  class Statement {
    run(...params: unknown[]): { lastInsertRowid: number | bigint; changes: number };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    iterate(...params: unknown[]): IterableIterator<unknown>;
  }
  export = Database;
}
