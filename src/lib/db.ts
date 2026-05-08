import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "dashboard.sqlite");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  return _db;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      notes TEXT,
      company TEXT NOT NULL DEFAULT 'PERSONAL',
      priority TEXT NOT NULL DEFAULT 'P3',
      status TEXT NOT NULL DEFAULT 'todo',
      due_at TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      source_provider TEXT,
      source_message_id TEXT,
      source_subject TEXT,
      source_sender TEXT,
      source_link TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_tasks_message ON tasks(source_provider, source_message_id)
      WHERE source_message_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS email_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TEXT,
      default_company TEXT NOT NULL DEFAULT 'PERSONAL',
      last_sync_at TEXT,
      history_token TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(provider, email)
    );

    CREATE TABLE IF NOT EXISTS synced_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      message_id TEXT NOT NULL,
      subject TEXT,
      sender TEXT,
      received_at TEXT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      UNIQUE(provider, message_id)
    );

    CREATE TABLE IF NOT EXISTS company_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      company TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'sender'
    );
  `);
}
