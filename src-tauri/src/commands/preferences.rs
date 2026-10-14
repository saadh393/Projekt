use rusqlite::{named_params, Connection, OptionalExtension};
use serde::Serialize;
use tauri::State;

use crate::commands::command_error;
use crate::db::Database;

const UI_SESSION_KEY: &str = "ui_session";
const REMEMBER_SESSION_KEY: &str = "remember_session";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UiSession {
    pub remember: bool,
    pub state: Option<String>,
}

#[tauri::command]
pub fn get_ui_session(db: State<'_, Database>) -> Result<UiSession, String> {
    db.with_connection(|connection| {
        let remember = remember_session(connection)?;
        let state = if remember {
            read_preference(connection, UI_SESSION_KEY)?
        } else {
            None
        };

        Ok(UiSession { remember, state })
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn save_ui_session_state(db: State<'_, Database>, state: String) -> Result<(), String> {
    db.with_connection(|connection| {
        serde_json::from_str::<serde_json::Map<String, serde_json::Value>>(&state)
            .map_err(|error| anyhow::anyhow!("session state must be a JSON object: {error}"))?;

        if remember_session(connection)? {
            write_preference(connection, UI_SESSION_KEY, &state)?;
        }

        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_remember_session(db: State<'_, Database>, remember: bool) -> Result<bool, String> {
    db.with_transaction(|transaction| {
        write_preference(
            transaction,
            REMEMBER_SESSION_KEY,
            if remember { "1" } else { "0" },
        )?;

        if !remember {
            transaction.execute(
                "DELETE FROM preferences WHERE key = :key",
                named_params! { ":key": UI_SESSION_KEY },
            )?;
        }

        Ok(remember)
    })
    .map_err(command_error)
}

fn remember_session(connection: &Connection) -> anyhow::Result<bool> {
    Ok(read_preference(connection, REMEMBER_SESSION_KEY)?.as_deref() != Some("0"))
}

fn read_preference(connection: &Connection, key: &str) -> anyhow::Result<Option<String>> {
    connection
        .query_row(
            "SELECT value FROM preferences WHERE key = :key",
            named_params! { ":key": key },
            |row| row.get::<_, String>("value"),
        )
        .optional()
        .map_err(Into::into)
}

fn write_preference(connection: &Connection, key: &str, value: &str) -> anyhow::Result<()> {
    connection.execute(
        "INSERT INTO preferences (key, value)
         VALUES (:key, :value)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        named_params! { ":key": key, ":value": value },
    )?;

    Ok(())
}
