use rusqlite::{named_params, OptionalExtension};
use tauri::State;

use crate::commands::command_error;
use crate::db::id::new_id;
use crate::db::{now_timestamp, Database};
use crate::models::category::{category_from_row, Category, CategoryInput};

#[tauri::command]
pub fn list_categories(
    db: State<'_, Database>,
    show_hidden: Option<bool>,
) -> Result<Vec<Category>, String> {
    db.with_connection(|connection| {
        let sql = if show_hidden.unwrap_or(false) {
            "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
        } else {
            "SELECT * FROM categories WHERE hidden = 0 ORDER BY sort_order ASC, name ASC"
        };
        let mut statement = connection.prepare(sql)?;
        let categories = statement
            .query_map([], category_from_row)?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(categories)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn get_category(db: State<'_, Database>, id: String) -> Result<Option<Category>, String> {
    db.with_connection(|connection| {
        connection
            .query_row(
                "SELECT * FROM categories WHERE id = :id",
                named_params! { ":id": id },
                category_from_row,
            )
            .optional()
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn create_category(db: State<'_, Database>, input: CategoryInput) -> Result<Category, String> {
    db.with_connection(|connection| {
        let id = new_id();
        let created_at = now_timestamp();

        connection.execute(
            "INSERT INTO categories (id, name, icon, color, sort_order, hidden, created_at)
             VALUES (:id, :name, :icon, :color, :sort_order, :hidden, :created_at)",
            named_params! {
                ":id": id,
                ":name": input.name.trim(),
                ":icon": input.icon.trim(),
                ":color": input.color.trim(),
                ":sort_order": input.sort_order.unwrap_or_default(),
                ":hidden": bool_to_i64(input.hidden.unwrap_or(false)),
                ":created_at": created_at,
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM categories WHERE id = :id",
                named_params! { ":id": id },
                category_from_row,
            )
            .map_err(Into::into)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn update_category(
    db: State<'_, Database>,
    id: String,
    input: CategoryInput,
) -> Result<Category, String> {
    db.with_connection(|connection| {
        connection.execute(
            "UPDATE categories
             SET name = :name, icon = :icon, color = :color, sort_order = :sort_order, hidden = :hidden
             WHERE id = :id",
            named_params! {
                ":id": id,
                ":name": input.name.trim(),
                ":icon": input.icon.trim(),
                ":color": input.color.trim(),
                ":sort_order": input.sort_order.unwrap_or_default(),
                ":hidden": bool_to_i64(input.hidden.unwrap_or(false)),
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM categories WHERE id = :id",
                named_params! { ":id": id },
                category_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("category not found"))
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_category_hidden(
    db: State<'_, Database>,
    id: String,
    hidden: bool,
) -> Result<Category, String> {
    db.with_connection(|connection| {
        connection.execute(
            "UPDATE categories SET hidden = :hidden WHERE id = :id",
            named_params! {
                ":id": id,
                ":hidden": bool_to_i64(hidden),
            },
        )?;

        connection
            .query_row(
                "SELECT * FROM categories WHERE id = :id",
                named_params! { ":id": id },
                category_from_row,
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("category not found"))
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn reorder_categories(
    db: State<'_, Database>,
    ids: Vec<String>,
) -> Result<Vec<Category>, String> {
    db.with_connection(|connection| {
        for (sort_order, id) in ids.iter().enumerate() {
            connection.execute(
                "UPDATE categories SET sort_order = :sort_order WHERE id = :id",
                named_params! {
                    ":id": id,
                    ":sort_order": sort_order as i64,
                },
            )?;
        }

        let mut statement =
            connection.prepare("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")?;
        let categories = statement
            .query_map([], category_from_row)?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(categories)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn delete_category(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.with_connection(|connection| {
        connection.execute(
            "DELETE FROM categories WHERE id = :id",
            named_params! { ":id": id },
        )?;

        Ok(())
    })
    .map_err(command_error)
}

fn bool_to_i64(value: bool) -> i64 {
    if value {
        1
    } else {
        0
    }
}
