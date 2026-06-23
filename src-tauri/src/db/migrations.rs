use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

const ADD_LIST_DIVIDERS: &str = "CREATE TABLE IF NOT EXISTS list_dividers (
    id TEXT PRIMARY KEY,
    label TEXT,
    category_id TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_list_dividers_category_sort
ON list_dividers(category_id, sort_order);";

pub fn run(connection: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![
        M::up(include_str!("schema.sql")),
        M::up(ADD_LIST_DIVIDERS),
    ]);

    migrations.to_latest(connection)
}
