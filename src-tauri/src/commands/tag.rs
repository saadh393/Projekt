use rusqlite::{named_params, OptionalExtension};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::Database;
use crate::models::tag::{tag_from_row, Tag, TagInput};

#[tauri::command]
pub fn list_tags(db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    db.with_connection(|connection| {
        let mut statement = connection.prepare("SELECT * FROM tags ORDER BY name ASC")?;
        let tags = statement
            .query_map([], tag_from_row)?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(tags)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_tag(db: State<'_, Database>, input: TagInput) -> Result<Tag, String> {
    db.with_connection(|connection| {
        let name = input.name.trim().to_string();
        let existing = connection
            .query_row(
                "SELECT * FROM tags WHERE name = :name",
                named_params! { ":name": name },
                tag_from_row,
            )
            .optional()?;

        if let Some(tag) = existing {
            return Ok(tag);
        }

        let id = new_id();
        connection.execute(
            "INSERT INTO tags (id, name) VALUES (:id, :name)",
            named_params! { ":id": id, ":name": name },
        )?;

        connection
            .query_row(
                "SELECT * FROM tags WHERE id = :id",
                named_params! { ":id": id },
                tag_from_row,
            )
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_tag(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM tags WHERE id = :id",
            named_params! { ":id": id },
        )?;

        Ok(())
    })
    .map_err(command_error)
}
