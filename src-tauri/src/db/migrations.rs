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

const ADD_PROJECT_COMMAND_HIDDEN: &str = "CREATE TABLE IF NOT EXISTS project_command_hidden (
    project_id TEXT NOT NULL,
    command_template_id TEXT NOT NULL,
    PRIMARY KEY (project_id, command_template_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (command_template_id) REFERENCES command_templates(id) ON DELETE CASCADE
);";

const SPREAD_LIST_SORT_ORDER: &str = "UPDATE projects SET sort_order = sort_order * 1024;
UPDATE list_dividers SET sort_order = sort_order * 1024;";

const MERGE_LIST_PREFERENCES_INTO_UI_SESSION: &str = "INSERT INTO preferences (key, value)
SELECT 'ui_session', json_object(
    'sortMode', (SELECT value FROM preferences WHERE key = 'project_sort_mode'),
    'showHiddenProjects', CASE
        WHEN (SELECT value FROM preferences WHERE key = 'show_hidden_projects') = '1' THEN json('true')
        ELSE json('false')
    END
)
WHERE EXISTS (
    SELECT 1 FROM preferences WHERE key IN ('project_sort_mode', 'show_hidden_projects')
)
ON CONFLICT(key) DO NOTHING;
DELETE FROM preferences WHERE key IN ('project_sort_mode', 'show_hidden_projects');";

const ADD_PROJECT_COMMAND_LINKS: &str = "CREATE TABLE IF NOT EXISTS project_command_links (
    project_id TEXT NOT NULL,
    command_template_id TEXT NOT NULL,
    label_override TEXT,
    command_override TEXT,
    execution_target_override TEXT,
    PRIMARY KEY (project_id, command_template_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (command_template_id) REFERENCES command_templates(id) ON DELETE CASCADE
);
INSERT OR IGNORE INTO project_command_links (project_id, command_template_id)
SELECT p.id, ct.id FROM projects p CROSS JOIN command_templates ct WHERE ct.project_id IS NULL;
CREATE VIEW IF NOT EXISTS project_commands AS
SELECT ct.project_id AS scope_project_id,
       ct.id,
       ct.label,
       ct.command,
       ct.execution_target,
       ct.project_id,
       0 AS inherited,
       0 AS overridden
FROM command_templates ct
WHERE ct.project_id IS NOT NULL
UNION ALL
SELECT pcl.project_id AS scope_project_id,
       ct.id,
       COALESCE(pcl.label_override, ct.label) AS label,
       COALESCE(pcl.command_override, ct.command) AS command,
       COALESCE(pcl.execution_target_override, ct.execution_target) AS execution_target,
       NULL AS project_id,
       1 AS inherited,
       (pcl.label_override IS NOT NULL
         OR pcl.command_override IS NOT NULL
         OR pcl.execution_target_override IS NOT NULL) AS overridden
FROM project_command_links pcl
JOIN command_templates ct ON ct.id = pcl.command_template_id;";

pub fn run(connection: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![
        M::up(include_str!("schema.sql")),
        M::up(ADD_LIST_DIVIDERS),
        M::up(ADD_COMMAND_SCOPE_AND_TARGET),
        M::up(ADD_PROJECT_COMMAND_ORDER),
        M::up(ADD_PROJECT_COMMAND_HIDDEN),
        M::up(SPREAD_LIST_SORT_ORDER),
        M::up(MERGE_LIST_PREFERENCES_INTO_UI_SESSION),
        M::up(ADD_PROJECT_COMMAND_LINKS),
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

    #[test]
    fn spreads_list_sort_order_keeping_relative_positions() {
        let mut connection = Connection::open_in_memory().unwrap();
        let previous = Migrations::new(vec![
            M::up(include_str!("schema.sql")),
            M::up(ADD_LIST_DIVIDERS),
        ]);
        previous.to_latest(&mut connection).unwrap();
        connection
            .execute_batch(
                "INSERT INTO projects (
                   id, name, path, sort_order, hidden, pinned_commands, created_at, updated_at
                 ) VALUES ('project-1', 'One', '/tmp/one', 0, 0, '[]', 0, 0),
                          ('project-2', 'Two', '/tmp/two', 2, 0, '[]', 0, 0);
                 INSERT INTO list_dividers (id, label, category_id, sort_order, created_at)
                 VALUES ('divider-1', NULL, NULL, 1, 0);",
            )
            .unwrap();

        run(&mut connection).unwrap();

        let orders = connection
            .prepare(
                "SELECT id, sort_order FROM projects
                 UNION ALL SELECT id, sort_order FROM list_dividers
                 ORDER BY sort_order",
            )
            .unwrap()
            .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?)))
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        assert_eq!(
            orders,
            vec![
                ("project-1".to_string(), 0),
                ("divider-1".to_string(), 1024),
                ("project-2".to_string(), 2048),
            ]
        );
    }

    #[test]
    fn merges_list_preferences_into_ui_session() {
        let mut connection = Connection::open_in_memory().unwrap();
        let previous = Migrations::new(vec![M::up(include_str!("schema.sql"))]);
        previous.to_latest(&mut connection).unwrap();
        connection
            .execute_batch(
                "INSERT INTO preferences (key, value) VALUES
                   ('project_sort_mode', 'manual'),
                   ('show_hidden_projects', '1'),
                   ('preferred_terminal', 'warp');",
            )
            .unwrap();

        run(&mut connection).unwrap();

        let preferences = connection
            .prepare("SELECT key, value FROM preferences ORDER BY key")
            .unwrap()
            .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        assert_eq!(
            preferences,
            vec![
                ("preferred_terminal".to_string(), "warp".to_string()),
                (
                    "ui_session".to_string(),
                    r#"{"sortMode":"manual","showHiddenProjects":true}"#.to_string()
                ),
            ]
        );
    }

    #[test]
    fn links_existing_projects_to_global_commands_with_effective_overrides() {
        let mut connection = Connection::open_in_memory().unwrap();
        let previous = Migrations::new(vec![
            M::up(include_str!("schema.sql")),
            M::up(ADD_LIST_DIVIDERS),
            M::up(ADD_COMMAND_SCOPE_AND_TARGET),
        ]);
        previous.to_latest(&mut connection).unwrap();
        connection
            .execute_batch(
                "INSERT INTO projects (
                   id, name, path, sort_order, hidden, pinned_commands, created_at, updated_at
                 ) VALUES ('project-1', 'One', '/tmp/one', 0, 0, '[]', 0, 0);
                 INSERT INTO command_templates (id, label, command, project_id)
                 VALUES ('global-1', 'Dev', 'npm run dev', NULL),
                        ('owned-1', 'Test', 'npm test', 'project-1');",
            )
            .unwrap();

        run(&mut connection).unwrap();
        connection
            .execute(
                "UPDATE project_command_links SET command_override = 'pnpm dev'
                 WHERE project_id = 'project-1' AND command_template_id = 'global-1'",
                [],
            )
            .unwrap();

        let commands = connection
            .prepare(
                "SELECT id, command, inherited, overridden FROM project_commands
                 WHERE scope_project_id = 'project-1' ORDER BY id",
            )
            .unwrap()
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, bool>(2)?,
                    row.get::<_, bool>(3)?,
                ))
            })
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        assert_eq!(
            commands,
            vec![
                ("global-1".to_string(), "pnpm dev".to_string(), true, true),
                ("owned-1".to_string(), "npm test".to_string(), false, false),
            ]
        );
        let global_command = connection
            .query_row(
                "SELECT command FROM command_templates WHERE id = 'global-1'",
                [],
                |row| row.get::<_, String>(0),
            )
            .unwrap();
        assert_eq!(global_command, "npm run dev");
    }
}
