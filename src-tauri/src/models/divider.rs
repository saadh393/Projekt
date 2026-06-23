use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Divider {
    pub id: String,
    pub label: Option<String>,
    pub category_id: Option<String>,
    pub sort_order: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DividerInput {
    pub label: Option<String>,
    pub category_id: Option<String>,
    pub sort_order: Option<i64>,
}

pub fn divider_from_row(row: &Row<'_>) -> rusqlite::Result<Divider> {
    Ok(Divider {
        id: row.get("id")?,
        label: row.get("label")?,
        category_id: row.get("category_id")?,
        sort_order: row.get("sort_order")?,
        created_at: row.get("created_at")?,
    })
}
