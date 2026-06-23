use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLauncher {
    pub id: String,
    pub label: String,
    pub app_path: String,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLauncherInput {
    pub label: String,
    pub app_path: String,
    pub sort_order: Option<i64>,
}

pub fn app_launcher_from_row(row: &Row<'_>) -> rusqlite::Result<AppLauncher> {
    Ok(AppLauncher {
        id: row.get("id")?,
        label: row.get("label")?,
        app_path: row.get("app_path")?,
        sort_order: row.get("sort_order")?,
    })
}
