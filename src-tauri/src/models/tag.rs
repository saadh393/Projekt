use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagInput {
    pub name: String,
}

pub fn tag_from_row(row: &Row<'_>) -> rusqlite::Result<Tag> {
    Ok(Tag {
        id: row.get("id")?,
        name: row.get("name")?,
    })
}
