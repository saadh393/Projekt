PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  path TEXT NOT NULL,
  category_id TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  pinned_commands TEXT NOT NULL DEFAULT '[]',
  last_opened_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS project_tags (
  project_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_launchers (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  app_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS command_templates (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  command TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_hidden ON projects(hidden);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_app_launchers_sort_order ON app_launchers(sort_order, label);
