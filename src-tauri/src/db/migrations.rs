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

const ADD_COMMAND_SCOPE_AND_TARGET: &str = "ALTER TABLE command_templates
ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE command_templates
ADD COLUMN execution_target TEXT NOT NULL DEFAULT 'external';
CREATE INDEX IF NOT EXISTS idx_command_templates_project_id
ON command_templates(project_id);";

const ADD_PROJECT_COMMAND_ORDER: &str = "CREATE TABLE IF NOT EXISTS project_command_order (
    project_id TEXT NOT NULL,
    command_template_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, command_template_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (command_template_id) REFERENCES command_templates(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_command_order_project
ON project_command_order(project_id, sort_order);";

pub fn run(connection: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![
        M::up(include_str!("schema.sql")),
        M::up(ADD_LIST_DIVIDERS),
        M::up(ADD_COMMAND_SCOPE_AND_TARGET),
        M::up(ADD_PROJECT_COMMAND_ORDER),
    ]);

    migrations.to_latest(connection)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_command_scope_and_execution_target() {
        let mut connection = Connection::open_in_memory().unwrap();
        let previous = Migrations::new(vec![
            M::up(include_str!("schema.sql")),
            M::up(ADD_LIST_DIVIDERS),
        ]);
        previous.to_latest(&mut connection).unwrap();
        connection
            .execute(
                "INSERT INTO command_templates (id, label, command)
                 VALUES ('command-1', 'Dev', 'npm run dev')",
                [],
            )
            .unwrap();

        run(&mut connection).unwrap();

        let command = connection
            .query_row(
                "SELECT project_id, execution_target
                 FROM command_templates WHERE id = 'command-1'",
                [],
                |row| Ok((row.get::<_, Option<String>>(0)?, row.get::<_, String>(1)?)),
            )
            .unwrap();
        assert_eq!(command, (None, "external".to_string()));

        connection
            .pragma_update(None, "foreign_keys", "ON")
            .unwrap();
        connection
            .execute(
                "INSERT INTO projects (
                   id, name, path, sort_order, hidden, pinned_commands, created_at, updated_at
                 ) VALUES ('project-1', 'Project', '/tmp/project', 0, 0, '[]', 0, 0)",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO command_templates (
                   id, label, command, project_id, execution_target
                 ) VALUES ('command-2', 'Test', 'npm test', 'project-1', 'embedded')",
                [],
            )
            .unwrap();
        connection
            .execute("DELETE FROM projects WHERE id = 'project-1'", [])
            .unwrap();
        let scoped_count = connection
            .query_row(
                "SELECT count(*) FROM command_templates WHERE id = 'command-2'",
                [],
                |row| row.get::<_, i64>(0),
            )
            .unwrap();
        assert_eq!(scoped_count, 0);
    }
}
