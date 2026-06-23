use rusqlite::{named_params, OptionalExtension};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::Database;
use crate::models::launcher::{app_launcher_from_row, AppLauncher, AppLauncherInput};

#[tauri::command]
pub fn list_app_launchers(db: State<'_, Database>) -> Result<Vec<AppLauncher>, String> {
    db.with_connection(|connection| {
        let mut statement =
            connection.prepare("SELECT * FROM app_launchers ORDER BY sort_order ASC, label ASC")?;
        let launchers = statement
            .query_map([], app_launcher_from_row)?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(launchers)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_app_launcher(
    db: State<'_, Database>,
    input: AppLauncherInput,
) -> Result<AppLauncher, String> {
    db.with_connection(|connection| {
        let id = new_id();

        connection.execute(
            "INSERT INTO app_launchers (id, label, app_path, sort_order)
             VALUES (:id, :label, :app_path, :sort_order)",
            named_params! {
                ":id": id,
                ":label": input.label.trim(),
                ":app_path": input.app_path.trim(),
                ":sort_order": input.sort_order.unwrap_or_default(),
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM app_launchers WHERE id = :id",
                named_params! { ":id": id },
                app_launcher_from_row,
            )
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn update_app_launcher(
    db: State<'_, Database>,
    id: String,
    input: AppLauncherInput,
) -> Result<AppLauncher, String> {
    db.with_connection(|connection| {
        connection.execute(
            "UPDATE app_launchers
             SET label = :label, app_path = :app_path, sort_order = :sort_order
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":label": input.label.trim(),
                ":app_path": input.app_path.trim(),
                ":sort_order": input.sort_order.unwrap_or_default(),
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM app_launchers WHERE id = :id",
                named_params! { ":id": id },
                app_launcher_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("app launcher not found"))
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_app_launcher(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM app_launchers WHERE id = :id",
            named_params! { ":id": id },
        )?;

        Ok(())
    })
    .map_err(command_error)
}
