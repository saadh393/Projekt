use rusqlite::named_params;
use serde::Deserialize;
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::{now_timestamp, Database};
use crate::models::divider::{divider_from_row, Divider, DividerInput};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReorderItem {
    pub kind: String,
    pub id: String,
}

#[tauri::command]
pub fn list_dividers(
    db: State<'_, Database>,
    category_id: Option<String>,
) -> Result<Vec<Divider>, String> {
    db.with_connection(|connection| {
        let mut statement = match category_id.as_ref() {
            Some(_) => connection.prepare(
                "SELECT * FROM list_dividers WHERE category_id = :category_id ORDER BY sort_order ASC",
            )?,
            None => connection.prepare(
                "SELECT * FROM list_dividers WHERE category_id IS NULL ORDER BY sort_order ASC",
            )?,
        };

        let rows = if let Some(id) = category_id.as_ref() {
            statement
                .query_map(named_params! { ":category_id": id }, divider_from_row)?
                .collect::<Result<Vec<_>, _>>()?
        } else {
            statement
                .query_map([], divider_from_row)?
                .collect::<Result<Vec<_>, _>>()?
        };

        Ok(rows)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_divider(db: State<'_, Database>, input: DividerInput) -> Result<Divider, String> {
    db.with_connection(|connection| {
        let id = new_id();
        let created_at = now_timestamp();
        let label = input.label.as_ref().map(|value| value.trim().to_string()).filter(|value| !value.is_empty());

        connection.execute(
            "INSERT INTO list_dividers (id, label, category_id, sort_order, created_at)
             VALUES (:id, :label, :category_id, :sort_order, :created_at)",
            named_params! {
                ":id": id,
                ":label": label,
                ":category_id": input.category_id,
                ":sort_order": input.sort_order.unwrap_or_default(),
                ":created_at": created_at,
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM list_dividers WHERE id = :id",
                named_params! { ":id": id },
                divider_from_row,
            )
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn update_divider(
    db: State<'_, Database>,
    id: String,
    input: DividerInput,
) -> Result<Divider, String> {
    db.with_connection(|connection| {
        let label = input.label.as_ref().map(|value| value.trim().to_string()).filter(|value| !value.is_empty());

        connection.execute(
            "UPDATE list_dividers
             SET label = :label,
                 category_id = :category_id,
                 sort_order = COALESCE(:sort_order, sort_order)
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":label": label,
                ":category_id": input.category_id,
                ":sort_order": input.sort_order,
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM list_dividers WHERE id = :id",
                named_params! { ":id": id },
                divider_from_row,
            )
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_divider(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM list_dividers WHERE id = :id",
            named_params! { ":id": id },
        )?;
        Ok(())
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn reorder_list_items(
    db: State<'_, Database>,
    items: Vec<ReorderItem>,
) -> Result<(), String> {
    db.with_connection(|connection| {
        let updated_at = now_timestamp();

        for (sort_order, item) in items.iter().enumerate() {
            match item.kind.as_str() {
                "project" => {
                    connection.execute(
                        "UPDATE projects SET sort_order = :sort_order, updated_at = :updated_at WHERE id = :id",
                        named_params! {
                            ":id": item.id,
                            ":sort_order": sort_order as i64,
                            ":updated_at": updated_at,
                        },
                    )?;
                }
                "divider" => {
                    connection.execute(
                        "UPDATE list_dividers SET sort_order = :sort_order WHERE id = :id",
                        named_params! {
                            ":id": item.id,
                            ":sort_order": sort_order as i64,
                        },
                    )?;
                }
                _ => {}
            }
        }

        Ok(())
    })
    .map_err(command_error)
}
