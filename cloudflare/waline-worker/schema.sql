CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  nick TEXT NOT NULL,
  mail TEXT,
  link TEXT,
  comment TEXT NOT NULL,
  raw_comment TEXT NOT NULL,
  pid TEXT,
  rid TEXT,
  reply_user_nick TEXT,
  user_id TEXT,
  type TEXT NOT NULL DEFAULT 'guest',
  status TEXT NOT NULL DEFAULT 'approved',
  sticky INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  ua TEXT,
  ip TEXT,
  addr TEXT,
  browser TEXT,
  os TEXT,
  inserted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_url ON comments (url);
CREATE INDEX IF NOT EXISTS idx_comments_rid ON comments (rid);
CREATE INDEX IF NOT EXISTS idx_comments_inserted_at ON comments (inserted_at);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  url TEXT,
  avatar TEXT,
  type TEXT NOT NULL DEFAULT 'guest',
  label TEXT,
  two_factor_auth TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users (type);

CREATE TABLE IF NOT EXISTS article_counters (
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (path, type)
);
