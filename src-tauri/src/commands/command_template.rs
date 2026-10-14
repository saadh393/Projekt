use rusqlite::{named_params, Connection, OptionalExtension};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::Database;
use crate::models::command_template::{
    command_template_from_row, CommandTemplate, CommandTemplateInput,
};

#[tauri::command]
pub fn list_command_templates(
    db: State<'_, Database>,
    project_id: Option<String>,
) -> Result<Vec<CommandTemplate>, String> {
    db.with_connection(|connection| {
        let Some(project_id) = project_id else {
            let mut statement = connection.prepare(
                "SELECT *, 0 AS hidden, 0 AS inherited, 0 AS overridden
                 FROM command_templates
                 WHERE project_id IS NULL
                 ORDER BY label COLLATE NOCASE ASC",
            )?;
            let templates = statement
                .query_map([], command_template_from_row)?
                .collect::<Result<Vec<_>, _>>()?;
            return Ok(templates);
        };

        let mut statement = connection.prepare(
            "SELECT pc.*,
                    CASE WHEN pch.command_template_id IS NULL THEN 0 ELSE 1 END AS hidden
             FROM project_commands pc
             LEFT JOIN project_command_order pco
               ON pco.command_template_id = pc.id
               AND pco.project_id = :project_id
             LEFT JOIN project_command_hidden pch
               ON pch.command_template_id = pc.id
               AND pch.project_id = :project_id
             WHERE pc.scope_project_id = :project_id
             ORDER BY
               CASE WHEN pco.sort_order IS NULL THEN 1 ELSE 0 END,
               pco.sort_order ASC,
               pc.inherited ASC,
               pc.label COLLATE NOCASE ASC",
        )?;
        let templates = statement
            .query_map(
                named_params! { ":project_id": project_id },
                command_template_from_row,
            )?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(templates)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_command_template(
    db: State<'_, Database>,
    input: CommandTemplateInput,
) -> Result<CommandTemplate, String> {
    db.with_connection(|connection| {
        let input = normalized_input(input)?;
        let id = new_id();

        connection.execute(
            "INSERT INTO command_templates (id, label, command, project_id, execution_target)
             VALUES (:id, :label, :command, :project_id, :execution_target)",
            named_params! {
                ":id": id,
                ":label": input.label,
                ":command": input.command,
                ":project_id": input.project_id.as_deref(),
                ":execution_target": input.execution_target.as_str(),
            },
        )?;

        find_template(connection, &id)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn update_command_template(
    db: State<'_, Database>,
    id: String,
    input: CommandTemplateInput,
) -> Result<CommandTemplate, String> {
    db.with_connection(|connection| {
        let input = normalized_input(input)?;
        connection.execute(
            "UPDATE command_templates
             SET label = :label,
                 command = :command,
                 execution_target = :execution_target
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":label": input.label,
                ":command": input.command,
                ":execution_target": input.execution_target.as_str(),
            },
        )?;

        find_template(connection, &id)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_command_template(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM command_templates WHERE id = :id",
            named_params! { ":id": id },
        )?;

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn link_global_commands(
    db: State<'_, Database>,
    project_id: String,
    template_ids: Vec<String>,
) -> Result<(), String> {
    db.with_transaction(|transaction| {
        for template_id in &template_ids {
            let is_global = transaction
                .query_row(
                    "SELECT 1 FROM command_templates WHERE id = :id AND project_id IS NULL",
                    named_params! { ":id": template_id },
                    |_| Ok(()),
                )
                .optional()?
                .is_some();

            if !is_global {
                anyhow::bail!("global command {template_id} not found");
            }

            transaction.execute(
                "INSERT OR IGNORE INTO project_command_links (project_id, command_template_id)
                 VALUES (:project_id, :command_template_id)",
                named_params! {
                    ":project_id": &project_id,
                    ":command_template_id": template_id,
                },
            )?;
        }

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn unlink_global_command(
    db: State<'_, Database>,
    project_id: String,
    template_id: String,
) -> Result<(), String> {
    db.with_transaction(|transaction| {
        for table in [
            "project_command_links",
            "project_command_order",
            "project_command_hidden",
        ] {
            transaction.execute(
                &format!(
                    "DELETE FROM {table}
                     WHERE project_id = :project_id AND command_template_id = :template_id"
                ),
                named_params! {
                    ":project_id": &project_id,
                    ":template_id": &template_id,
                },
            )?;
        }

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn override_project_command(
    db: State<'_, Database>,
    project_id: String,
    template_id: String,
    input: CommandTemplateInput,
) -> Result<(), String> {
    db.with_connection(|connection| {
        let input = normalized_input(input)?;
        let changed = connection.execute(
            "UPDATE project_command_links
             SET label_override = NULLIF(:label, ct.label),
                 command_override = NULLIF(:command, ct.command),
                 execution_target_override = NULLIF(:execution_target, ct.execution_target)
             FROM command_templates ct
             WHERE ct.id = project_command_links.command_template_id
               AND project_command_links.project_id = :project_id
               AND project_command_links.command_template_id = :template_id",
            named_params! {
                ":project_id": &project_id,
                ":template_id": &template_id,
                ":label": input.label,
                ":command": input.command,
                ":execution_target": input.execution_target.as_str(),
            },
        )?;

        if changed == 0 {
            anyhow::bail!("command is not inherited by this project");
        }

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn reset_project_command_override(
    db: State<'_, Database>,
    project_id: String,
    template_id: String,
) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "UPDATE project_command_links
             SET label_override = NULL, command_override = NULL, execution_target_override = NULL
             WHERE project_id = :project_id AND command_template_id = :template_id",
            named_params! {
                ":project_id": &project_id,
                ":template_id": &template_id,
            },
        )?;

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn reorder_project_commands(
    db: State<'_, Database>,
    project_id: String,
    template_ids: Vec<String>,
) -> Result<(), String> {
    db.with_transaction(|transaction| {
        transaction.execute(
            "DELETE FROM project_command_order WHERE project_id = :project_id",
            named_params! { ":project_id": &project_id },
        )?;

        for (sort_order, template_id) in template_ids.iter().enumerate() {
            transaction.execute(
                "INSERT OR IGNORE INTO project_command_order
                 (project_id, command_template_id, sort_order)
                 VALUES (:project_id, :command_template_id, :sort_order)",
                named_params! {
                    ":project_id": &project_id,
                    ":command_template_id": template_id,
                    ":sort_order": sort_order as i64,
                },
            )?;
        }

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_project_command_hidden(
    db: State<'_, Database>,
    project_id: String,
    command_template_id: String,
    hidden: bool,
) -> Result<(), String> {
    db.with_connection(|connection| {
        if hidden {
            connection.execute(
                "INSERT OR IGNORE INTO project_command_hidden
                 (project_id, command_template_id)
                 VALUES (:project_id, :command_template_id)",
                named_params! {
                    ":project_id": &project_id,
                    ":command_template_id": &command_template_id,
                },
            )?;
        } else {
            connection.execute(
                "DELETE FROM project_command_hidden
                 WHERE project_id = :project_id AND command_template_id = :command_template_id",
                named_params! {
                    ":project_id": &project_id,
                    ":command_template_id": &command_template_id,
                },
            )?;
        }

        Ok(())
    })
    .map_err(command_error)
}

fn find_template(connection: &Connection, id: &str) -> anyhow::Result<CommandTemplate> {
    connection
        .query_row(
            "SELECT *, 0 AS hidden, 0 AS inherited, 0 AS overridden
             FROM command_templates WHERE id = :id",
            named_params! { ":id": id },
            command_template_from_row,
        )
        .optional()?
        .ok_or_else(|| anyhow::anyhow!("command template not found"))
}

fn normalized_input(mut input: CommandTemplateInput) -> anyhow::Result<CommandTemplateInput> {
    input.label = input.label.trim().to_string();
    input.command = input.command.trim().to_string();

    if input.label.is_empty() || input.command.is_empty() {
        anyhow::bail!("command label and command are required");
    }

    Ok(input)
}
