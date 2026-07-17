use rusqlite::{named_params, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::commands::command_error;
use crate::db::Database;

const PROJECT_SORT_MODE_KEY: &str = "project_sort_mode";
const SHOW_HIDDEN_PROJECTS_KEY: &str = "show_hidden_projects";

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProjectSortMode {
    Manual,
    Name,
    CreatedAt,
    LastOpenedAt,
}

impl ProjectSortMode {
    fn as_str(self) -> &'static str {
        match self {
            Self::Manual => "manual",
            Self::Name => "name",
            Self::CreatedAt => "createdAt",
            Self::LastOpenedAt => "lastOpenedAt",
        }
    }

    fn from_str(value: &str) -> Self {
        match value {
            "name" => Self::Name,
            "createdAt" => Self::CreatedAt,
            "manual" => Self::Manual,
            _ => Self::LastOpenedAt,
        }
    }
}

impl Default for ProjectSortMode {
    fn default() -> Self {
        Self::LastOpenedAt
    }
}

#[tauri::command]
pub fn get_project_sort_mode(db: State<'_, Database>) -> Result<ProjectSortMode, String> {
    db.with_connection(|connection| {
        let value = connection
            .query_row(
                "SELECT value FROM preferences WHERE key = :key",
                named_params! { ":key": PROJECT_SORT_MODE_KEY },
                |row| row.get::<_, String>("value"),
            )
            .optional()?;
        Ok(value
            .as_deref()
            .map(ProjectSortMode::from_str)
            .unwrap_or_default())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_project_sort_mode(
    db: State<'_, Database>,
    mode: ProjectSortMode,
) -> Result<ProjectSortMode, String> {
    db.with_connection(|connection| {
        connection.execute(
            "INSERT INTO preferences (key, value)
             VALUES (:key, :value)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            named_params! {
                ":key": PROJECT_SORT_MODE_KEY,
                ":value": mode.as_str(),
            },
        )?;
        Ok(mode)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn get_show_hidden_projects(db: State<'_, Database>) -> Result<bool, String> {
    db.with_connection(|connection| {
        let value = connection
            .query_row(
                "SELECT value FROM preferences WHERE key = :key",
                named_params! { ":key": SHOW_HIDDEN_PROJECTS_KEY },
                |row| row.get::<_, String>("value"),
            )
            .optional()?;
        Ok(value.as_deref() == Some("1"))
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_show_hidden_projects(
    db: State<'_, Database>,
    show: bool,
) -> Result<bool, String> {
    db.with_connection(|connection| {
        connection.execute(
            "INSERT INTO preferences (key, value)
             VALUES (:key, :value)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            named_params! {
                ":key": SHOW_HIDDEN_PROJECTS_KEY,
                ":value": if show { "1" } else { "0" },
            },
        )?;
        Ok(show)
    })
    .map_err(command_error)
}
