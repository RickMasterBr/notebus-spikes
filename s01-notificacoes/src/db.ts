import * as SQLite from 'expo-sqlite';

export type RecordSource = 'button' | 'action-register' | 'action-missed' | 'tap';

export type LogRecord = {
  id: number;
  source: RecordSource;
  createdAt: string;
  note: string;
};

const db = SQLite.openDatabaseSync('s01.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS log_record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    dedupe_key TEXT UNIQUE
  );
`);

// dedupeKey keeps the same notification response from being recorded twice
// (listener + "last response" on cold start).
export const insertRecord = (source: RecordSource, note = '', dedupeKey: string | null = null): void => {
  db.runSync(
    'INSERT OR IGNORE INTO log_record (source, created_at, note, dedupe_key) VALUES (?, ?, ?, ?)',
    source,
    new Date().toISOString(),
    note,
    dedupeKey,
  );
};

export const listRecords = (): LogRecord[] =>
  db
    .getAllSync<{ id: number; source: RecordSource; created_at: string; note: string }>(
      'SELECT id, source, created_at, note FROM log_record ORDER BY id DESC LIMIT 50',
    )
    .map((row) => ({ id: row.id, source: row.source, createdAt: row.created_at, note: row.note }));

export const countRecords = (): number =>
  db.getFirstSync<{ total: number }>('SELECT COUNT(*) AS total FROM log_record')?.total ?? 0;
