use rusqlite::{named_params, OptionalExtension};
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
        let mut statement = connection.prepare(
            "SELECT ct.*
             FROM command_templates ct
             LEFT JOIN project_command_order pco
               ON pco.command_template_id = ct.id
               AND pco.project_id = :project_id
             WHERE ct.project_id IS NULL OR ct.project_id = :project_id
             ORDER BY
               CASE WHEN pco.sort_order IS NULL THEN 1 ELSE 0 END,
               pco.sort_order ASC,
               CASE WHEN ct.project_id IS NOT NULL THEN 0 ELSE 1 END,
               ct.label COLLATE NOCASE ASC",
        )?;
        let templates = statement
            .query_map(
                named_params! { ":project_id": project_id.as_deref() },
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

        connection
            .query_row(
                "SELECT * FROM command_templates WHERE id = :id",
                named_params! { ":id": id },
                command_template_from_row,
            )
            .map_err(Into::into)
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
                 project_id = :project_id,
                 execution_target = :execution_target
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":label": input.label,
                ":command": input.command,
                ":project_id": input.project_id.as_deref(),
                ":execution_target": input.execution_target.as_str(),
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM command_templates WHERE id = :id",
                named_params! { ":id": id },
                command_template_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("command template not found"))
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

fn normalized_input(mut input: CommandTemplateInput) -> anyhow::Result<CommandTemplateInput> {
    input.label = input.label.trim().to_string();
    input.command = input.command.trim().to_string();

    if input.label.is_empty() || input.command.is_empty() {
        anyhow::bail!("command label and command are required");
    }

    Ok(input)
}
