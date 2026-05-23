declare module "better-sqlite3" {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message: string) => void;
    nativeBinding?: string;
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface Statement {
    database: Database;
    source: string;
    reader: boolean;
    readonly: boolean;

    run(...params: unknown[]): RunResult;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    iterate(...params: unknown[]): IterableIterator<unknown>;
    pluck(toggleState?: boolean): this;
    expand(toggleState?: boolean): this;
    raw(toggleState?: boolean): this;
    bind(...params: unknown[]): this;
    columns(): Array<{ name: string; column: string | null; table: string | null; database: string | null; type: string | null }>;
    safeIntegers(toggleState?: boolean): this;
  }

  interface Transaction {
    (...params: unknown[]): unknown;
    database: Database;
    source: string;
  }

  class Database {
    constructor(filename: string | Buffer, options?: DatabaseOptions);
    
    name: string;
    open: boolean;
    inTransaction: boolean;
    readonly: boolean;
    memory: boolean;

    prepare(sql: string): Statement;
    transaction(fn: (...args: unknown[]) => unknown): Transaction;
    exec(sql: string): this;
    pragma(source: string, options?: { simple?: boolean }): unknown;
    checkpoint(databaseName?: string): this;
    function(name: string, fn: (...params: unknown[]) => unknown): this;
    aggregate(name: string, options: { start: unknown; step: (...args: unknown[]) => unknown; result?: () => unknown }): this;
    loadExtension(path: string): this;
    close(): this;
    defaultSafeIntegers(toggleState?: boolean): this;
    backup(destinationFile: string): { totalPages: number; remainingPages: number };
  }

  export = Database;
}
