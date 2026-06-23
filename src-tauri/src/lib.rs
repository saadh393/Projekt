mod commands;
mod db;
mod models;

use db::Database;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            let database = Database::open(&app_data_dir)?;
            app.manage(database);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::category::list_categories,
            commands::category::get_category,
            commands::category::create_category,
            commands::category::update_category,
            commands::category::set_category_hidden,
            commands::category::reorder_categories,
            commands::category::delete_category,
            commands::project::list_projects,
            commands::project::search_projects,
            commands::project::get_project,
            commands::project::create_project,
            commands::project::update_project,
            commands::project::set_project_hidden,
            commands::project::set_project_pinned_commands,
            commands::project::reorder_projects,
            commands::project::delete_project,
            commands::tag::list_tags,
            commands::tag::create_tag,
            commands::tag::delete_tag,
            commands::launcher::list_app_launchers,
            commands::launcher::create_app_launcher,
            commands::launcher::update_app_launcher,
            commands::launcher::delete_app_launcher,
            commands::command_template::list_command_templates,
            commands::command_template::create_command_template,
            commands::command_template::update_command_template,
            commands::command_template::delete_command_template,
            commands::shell::get_preferred_terminal,
            commands::shell::set_preferred_terminal,
            commands::shell::open_project_in_finder,
            commands::shell::open_project_in_vscode,
            commands::shell::open_project_in_terminal,
            commands::shell::launch_project_app,
            commands::shell::run_project_command_template,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
