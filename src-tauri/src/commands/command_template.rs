use rusqlite::{named_params, OptionalExtension};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::Database;
use crate::models::command_template::{
    command_template_from_row, CommandTemplate, CommandTemplateInput,
};

#[tauri::command]
pub fn list_command_templates(db: State<'_, Database>) -> Result<Vec<CommandTemplate>, String> {
    db.with_connection(|connection| {
        let mut statement =
            connection.prepare("SELECT * FROM command_templates ORDER BY label ASC")?;
        let templates = statement
            .query_map([], command_template_from_row)?
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
        let id = new_id();

        connection.execute(
            "INSERT INTO command_templates (id, label, command)
             VALUES (:id, :label, :command)",
            named_params! {
                ":id": id,
                ":label": input.label.trim(),
                ":command": input.command.trim(),
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
        connection.execute(
            "UPDATE command_templates
             SET label = :label, command = :command
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":label": input.label.trim(),
                ":command": input.command.trim(),
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
