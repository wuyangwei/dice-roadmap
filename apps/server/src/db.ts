import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });

export const db = new Database(path.join(config.dataDir, 'roadmap.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'ended')),
  joy_point_enabled INTEGER NOT NULL DEFAULT 0,
  joy_dice_1 INTEGER,
  joy_dice_2 INTEGER,
  started_at TEXT NOT NULL,
  ended_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_game
ON games(status)
WHERE status = 'active';

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  round_no INTEGER NOT NULL,
  dice_1 INTEGER NOT NULL CHECK (dice_1 BETWEEN 1 AND 6),
  dice_2 INTEGER NOT NULL CHECK (dice_2 BETWEEN 1 AND 6),
  base_result TEXT NOT NULL CHECK (base_result IN ('单', '双')),
  is_joy_point INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (game_id) REFERENCES games(id),
  UNIQUE(game_id, round_no)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'admin')),
  device_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

const upsertSetting = db.prepare(`
INSERT INTO settings (key, value)
VALUES (@key, @value)
ON CONFLICT(key) DO NOTHING
`);

upsertSetting.run({ key: 'operator_pin_hash', value: bcrypt.hashSync(config.operatorPin, 10) });
upsertSetting.run({ key: 'admin_pin_hash', value: bcrypt.hashSync(config.adminPin, 10) });
