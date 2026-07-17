use rusqlite::{named_params, Connection, OptionalExtension, Transaction};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::{now_timestamp, Database};
use crate::models::project::{
    project_from_row, Project, ProjectInput, ProjectListFilter, ProjectSort,
};

#[tauri::command]
pub fn list_projects(
    db: State<'_, Database>,
    filter: Option<ProjectListFilter>,
) -> Result<Vec<Project>, String> {
    db.with_connection(|connection| {
        let filter = filter.unwrap_or(ProjectListFilter {
            category_id: None,
            show_hidden: Some(false),
            sort: Some(ProjectSort::Manual),
        });
        let mut statement = connection.prepare(&format!(
            "SELECT * FROM projects
             WHERE (:show_hidden = 1 OR hidden = 0)
             AND (:category_id IS NULL OR category_id = :category_id)
             ORDER BY {}",
            project_order_by(filter.sort.as_ref())
        ))?;
        let mut projects = statement
            .query_map(
                named_params! {
                    ":show_hidden": bool_to_i64(filter.show_hidden.unwrap_or(false)),
                    ":category_id": filter.category_id.as_deref(),
                },
                project_from_row,
            )?
            .collect::<Result<Vec<_>, _>>()?;

        attach_project_tags(connection, &mut projects)?;

        Ok(projects)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn search_projects(
    db: State<'_, Database>,
    query: String,
    show_hidden: Option<bool>,
) -> Result<Vec<Project>, String> {
    db.with_connection(|connection| {
        let query = format!("%{}%", query.trim().to_lowercase());
        let mut statement = connection.prepare(
            "SELECT DISTINCT p.*
             FROM projects p
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN project_tags pt ON pt.project_id = p.id
             LEFT JOIN tags t ON t.id = pt.tag_id
             WHERE (:show_hidden = 1 OR p.hidden = 0)
             AND (
               lower(p.name) LIKE :query
               OR lower(coalesce(p.description, '')) LIKE :query
               OR lower(p.path) LIKE :query
               OR lower(coalesce(c.name, '')) LIKE :query
               OR lower(coalesce(t.name, '')) LIKE :query
             )
             ORDER BY p.last_opened_at DESC NULLS LAST, p.name ASC",
        )?;
        let mut projects = statement
            .query_map(
                named_params! {
                    ":query": query,
                    ":show_hidden": bool_to_i64(show_hidden.unwrap_or(false)),
                },
                project_from_row,
            )?
            .collect::<Result<Vec<_>, _>>()?;

        attach_project_tags(connection, &mut projects)?;

        Ok(projects)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn get_project(db: State<'_, Database>, id: String) -> Result<Option<Project>, String> {
    db.with_connection(|connection| {
        let mut project = connection
            .query_row(
                "SELECT * FROM projects WHERE id = :id",
                named_params! { ":id": id },
                project_from_row,
            )
            .optional()?;

        if let Some(project) = project.as_mut() {
            project.tags = load_project_tags(connection, &project.id)?;
        }

        Ok(project)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_project(db: State<'_, Database>, input: ProjectInput) -> Result<Project, String> {
    db.with_transaction(|transaction| {
        let id = new_id();
        let now = now_timestamp();
        transaction.execute(
            "INSERT INTO projects (
               id, name, description, path, category_id, color, sort_order, hidden,
               pinned_commands, last_opened_at, created_at, updated_at
             )
             VALUES (
               :id, :name, :description, :path, :category_id, :color, :sort_order, :hidden,
               :pinned_commands, NULL, :created_at, :updated_at
             )",
            named_params! {
                ":id": id,
                ":name": input.name.trim(),
                ":description": trimmed_optional(input.description.as_deref()),
                ":path": input.path.trim(),
                ":category_id": input.category_id.as_deref(),
                ":color": trimmed_optional(input.color.as_deref()),
                ":sort_order": input.sort_order.unwrap_or_default(),
                ":hidden": bool_to_i64(input.hidden.unwrap_or(false)),
                ":pinned_commands": "[]",
                ":created_at": now,
                ":updated_at": now,
            },
        )?;

        set_project_tags(transaction, &id, input.tags.unwrap_or_default())?;

        let mut project = transaction.query_row(
            "SELECT * FROM projects WHERE id = :id",
            named_params! { ":id": id },
            project_from_row,
        )?;
        project.tags = load_project_tags_from_transaction(transaction, &project.id)?;

        Ok(project)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn update_project(
    db: State<'_, Database>,
    id: String,
    input: ProjectInput,
) -> Result<Project, String> {
    db.with_transaction(|transaction| {
        let now = now_timestamp();
        transaction.execute(
            "UPDATE projects
             SET name = :name,
                 description = :description,
                 path = :path,
                 category_id = :category_id,
                 color = :color,
                 sort_order = :sort_order,
                 hidden = :hidden,
                 updated_at = :updated_at
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":name": input.name.trim(),
                ":description": trimmed_optional(input.description.as_deref()),
                ":path": input.path.trim(),
                ":category_id": input.category_id.as_deref(),
                ":color": trimmed_optional(input.color.as_deref()),
                ":sort_order": input.sort_order.unwrap_or_default(),
                ":hidden": bool_to_i64(input.hidden.unwrap_or(false)),
                ":updated_at": now,
            },
        )?;

        if let Some(tags) = input.tags {
            set_project_tags(transaction, &id, tags)?;
        }

        let mut project = transaction
            .query_row(
                "SELECT * FROM projects WHERE id = :id",
                named_params! { ":id": id },
                project_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("project not found"))?;
        project.tags = load_project_tags_from_transaction(transaction, &project.id)?;

        Ok(project)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_project_hidden(
    db: State<'_, Database>,
    id: String,
    hidden: bool,
) -> Result<Project, String> {
    db.with_connection(|connection| {
        connection.execute(
            "UPDATE projects SET hidden = :hidden, updated_at = :updated_at WHERE id = :id",
            named_params! {
                ":id": id,
                ":hidden": bool_to_i64(hidden),
                ":updated_at": now_timestamp(),
            },
        )?;

        let mut project = connection
            .query_row(
                "SELECT * FROM projects WHERE id = :id",
                named_params! { ":id": id },
                project_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("project not found"))?;
        project.tags = load_project_tags(connection, &project.id)?;

        Ok(project)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn reorder_projects(db: State<'_, Database>, ids: Vec<String>) -> Result<Vec<Project>, String> {
    db.with_connection(|connection| {
        for (sort_order, id) in ids.iter().enumerate() {
            connection.execute(
                "UPDATE projects SET sort_order = :sort_order, updated_at = :updated_at WHERE id = :id",
                named_params! {
                    ":id": id,
                    ":sort_order": sort_order as i64,
                    ":updated_at": now_timestamp(),
                },
            )?;
        }

        let mut statement =
            connection.prepare("SELECT * FROM projects ORDER BY sort_order ASC, name COLLATE NOCASE ASC")?;
        let mut projects = statement
            .query_map([], project_from_row)?
            .collect::<Result<Vec<_>, _>>()?;
        attach_project_tags(connection, &mut projects)?;

        Ok(projects)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_project(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM projects WHERE id = :id",
            named_params! { ":id": id },
        )?;

        Ok(())
    })
    .map_err(command_error)
}

pub fn mark_project_opened(connection: &Connection, id: &str) -> anyhow::Result<()> {
    connection.execute(
        "UPDATE projects
         SET last_opened_at = :last_opened_at, updated_at = :updated_at
         WHERE id = :id",
        named_params! {
            ":id": id,
            ":last_opened_at": now_timestamp(),
            ":updated_at": now_timestamp(),
        },
    )?;

    Ok(())
}

fn project_order_by(sort: Option<&ProjectSort>) -> &'static str {
    match sort.unwrap_or(&ProjectSort::Manual) {
        ProjectSort::Name => "name COLLATE NOCASE ASC",
        ProjectSort::DateAdded => "created_at DESC",
        ProjectSort::LastOpened => "last_opened_at DESC NULLS LAST, name COLLATE NOCASE ASC",
        ProjectSort::Manual => "sort_order ASC, name COLLATE NOCASE ASC",
    }
}

fn set_project_tags(
    transaction: &Transaction<'_>,
    project_id: &str,
    names: Vec<String>,
) -> anyhow::Result<()> {
    transaction.execute(
        "DELETE FROM project_tags WHERE project_id = :project_id",
        named_params! { ":project_id": project_id },
    )?;

    for name in normalize_tag_names(names) {
        let tag_id = find_or_create_tag(transaction, &name)?;
        transaction.execute(
            "INSERT OR IGNORE INTO project_tags (project_id, tag_id)
             VALUES (:project_id, :tag_id)",
            named_params! {
                ":project_id": project_id,
                ":tag_id": tag_id,
            },
        )?;
    }

    Ok(())
}

fn find_or_create_tag(transaction: &Transaction<'_>, name: &str) -> anyhow::Result<String> {
    if let Some(id) = transaction
        .query_row(
            "SELECT id FROM tags WHERE name = :name",
            named_params! { ":name": name },
            |row| row.get::<_, String>("id"),
        )
        .optional()?
    {
        return Ok(id);
    }

    let id = new_id();
    transaction.execute(
        "INSERT INTO tags (id, name) VALUES (:id, :name)",
        named_params! { ":id": id, ":name": name },
    )?;

    Ok(id)
}

fn attach_project_tags(connection: &Connection, projects: &mut [Project]) -> anyhow::Result<()> {
    for project in projects {
        project.tags = load_project_tags(connection, &project.id)?;
    }

    Ok(())
}

fn load_project_tags(connection: &Connection, project_id: &str) -> anyhow::Result<Vec<String>> {
    let mut statement = connection.prepare(
        "SELECT t.name
         FROM tags t
         INNER JOIN project_tags pt ON pt.tag_id = t.id
         WHERE pt.project_id = :project_id
         ORDER BY t.name ASC",
    )?;
    let tags = statement
        .query_map(named_params! { ":project_id": project_id }, |row| {
            row.get::<_, String>("name")
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(tags)
}

fn load_project_tags_from_transaction(
    transaction: &Transaction<'_>,
    project_id: &str,
) -> anyhow::Result<Vec<String>> {
    let mut statement = transaction.prepare(
        "SELECT t.name
         FROM tags t
         INNER JOIN project_tags pt ON pt.tag_id = t.id
         WHERE pt.project_id = :project_id
         ORDER BY t.name ASC",
    )?;
    let tags = statement
        .query_map(named_params! { ":project_id": project_id }, |row| {
            row.get::<_, String>("name")
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(tags)
}

fn normalize_tag_names(names: Vec<String>) -> Vec<String> {
    let mut normalized = names
        .into_iter()
        .map(|name| name.trim().to_lowercase())
        .filter(|name| !name.is_empty())
        .collect::<Vec<_>>();
    normalized.sort();
    normalized.dedup();
    normalized
}

fn trimmed_optional(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

fn bool_to_i64(value: bool) -> i64 {
    if value {
        1
    } else {
        0
    }
}
