use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CommandExecutionTarget {
    External,
    Embedded,
}

impl CommandExecutionTarget {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::External => "external",
            Self::Embedded => "embedded",
        }
    }

    pub fn from_str(value: &str) -> Self {
        match value {
            "embedded" => Self::Embedded,
            _ => Self::External,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandTemplate {
    pub id: String,
    pub label: String,
    pub command: String,
    pub project_id: Option<String>,
    pub execution_target: CommandExecutionTarget,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandTemplateInput {
    pub label: String,
    pub command: String,
    pub project_id: Option<String>,
    pub execution_target: CommandExecutionTarget,
}

pub fn command_template_from_row(row: &Row<'_>) -> rusqlite::Result<CommandTemplate> {
    Ok(CommandTemplate {
        id: row.get("id")?,
        label: row.get("label")?,
        command: row.get("command")?,
        project_id: row.get("project_id")?,
        execution_target: CommandExecutionTarget::from_str(
            &row.get::<_, String>("execution_target")?,
        ),
    })
}
