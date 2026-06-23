use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub path: String,
    pub category_id: Option<String>,
    pub color: Option<String>,
    pub sort_order: i64,
    pub hidden: bool,
    pub pinned_commands: Vec<String>,
    pub last_opened_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInput {
    pub name: String,
    pub description: Option<String>,
    pub path: String,
    pub category_id: Option<String>,
    pub color: Option<String>,
    pub sort_order: Option<i64>,
    pub hidden: Option<bool>,
    pub pinned_commands: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectListFilter {
    pub category_id: Option<String>,
    pub show_hidden: Option<bool>,
    pub sort: Option<ProjectSort>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProjectSort {
    Name,
    DateAdded,
    LastOpened,
    Manual,
}

pub fn project_from_row(row: &Row<'_>) -> rusqlite::Result<Project> {
    let pinned_commands_json: String = row.get("pinned_commands")?;
    let pinned_commands = serde_json::from_str(&pinned_commands_json).unwrap_or_default();

    Ok(Project {
        id: row.get("id")?,
        name: row.get("name")?,
        description: row.get("description")?,
        path: row.get("path")?,
        category_id: row.get("category_id")?,
        color: row.get("color")?,
        sort_order: row.get("sort_order")?,
        hidden: row.get::<_, i64>("hidden")? != 0,
        pinned_commands,
        last_opened_at: row.get("last_opened_at")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        tags: Vec::new(),
    })
}
