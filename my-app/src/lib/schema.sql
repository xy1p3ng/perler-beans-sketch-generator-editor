-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  source_image TEXT NOT NULL,
  preview_image TEXT,
  rows INTEGER NOT NULL DEFAULT 50,
  cols INTEGER NOT NULL DEFAULT 50,
  board_type TEXT DEFAULT '29x29',
  palette_id TEXT DEFAULT 'mard',
  color_limit INTEGER DEFAULT 32,
  dither_enabled INTEGER DEFAULT 0,
  status TEXT DEFAULT 'editing',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 格子表
CREATE TABLE IF NOT EXISTS cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  color_no TEXT,
  hex TEXT,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, row, col)
);

CREATE INDEX IF NOT EXISTS idx_cells_project ON cells(project_id);
CREATE INDEX IF NOT EXISTS idx_cells_project_row_col ON cells(project_id, row, col);

-- 色卡表
CREATE TABLE IF NOT EXISTS palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL DEFAULT 'MARD',
  color_no TEXT NOT NULL,
  name TEXT,
  hex TEXT NOT NULL,
  rgb TEXT,
  UNIQUE(brand, color_no)
);

-- 编辑历史表
CREATE TABLE IF NOT EXISTS edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_project ON edit_history(project_id);

-- Provider 配置表
CREATE TABLE IF NOT EXISTS provider_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  api_key TEXT,
  model TEXT,
  base_url TEXT,
  is_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider)
);
