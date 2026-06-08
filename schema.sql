-- 纸上山河 数据库表结构
-- Cloudflare D1 (SQLite)

DROP TABLE IF EXISTS works;

CREATE TABLE works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  scenic_spot TEXT NOT NULL,
  author TEXT DEFAULT '',
  dynasty TEXT DEFAULT '',
  description TEXT DEFAULT '',
  province TEXT DEFAULT '',
  latitude REAL DEFAULT 0,
  longitude REAL DEFAULT 0,
  category TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for common queries
CREATE INDEX idx_works_province ON works(province);
CREATE INDEX idx_works_dynasty ON works(dynasty);
CREATE INDEX idx_works_category ON works(category);
CREATE INDEX idx_works_author ON works(author);
