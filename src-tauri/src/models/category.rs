use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub sort_order: i64,
    pub hidden: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryInput {
    pub name: String,
    pub icon: String,
    pub color: String,
    pub sort_order: Option<i64>,
    pub hidden: Option<bool>,
}

pub fn category_from_row(row: &Row<'_>) -> rusqlite::Result<Category> {
    Ok(Category {
        id: row.get("id")?,
        name: row.get("name")?,
        icon: row.get("icon")?,
        color: row.get("color")?,
        sort_order: row.get("sort_order")?,
        hidden: row.get::<_, i64>("hidden")? != 0,
        created_at: row.get("created_at")?,
    })
}
