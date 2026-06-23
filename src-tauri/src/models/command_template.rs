use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandTemplate {
    pub id: String,
    pub label: String,
    pub command: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandTemplateInput {
    pub label: String,
    pub command: String,
}

pub fn command_template_from_row(row: &Row<'_>) -> rusqlite::Result<CommandTemplate> {
    Ok(CommandTemplate {
        id: row.get("id")?,
        label: row.get("label")?,
        command: row.get("command")?,
    })
}
