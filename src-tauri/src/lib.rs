mod commands;
mod db;
mod models;

use db::Database;
use tauri::{Manager, RunEvent};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(commands::terminal::TerminalManager::default())
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
            commands::divider::list_dividers,
            commands::divider::create_divider,
            commands::divider::update_divider,
            commands::divider::delete_divider,
            commands::divider::reorder_list_items,
            commands::project::list_projects,
            commands::project::search_projects,
            commands::project::get_project,
            commands::project::create_project,
            commands::project::update_project,
            commands::project::set_project_hidden,
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
            commands::command_template::reorder_project_commands,
            commands::command_template::set_project_command_hidden,
            commands::preferences::get_project_sort_mode,
            commands::preferences::set_project_sort_mode,
            commands::preferences::get_show_hidden_projects,
            commands::preferences::set_show_hidden_projects,
            commands::shell::get_preferred_terminal,
            commands::shell::set_preferred_terminal,
            commands::shell::get_preferred_shell,
            commands::shell::set_preferred_shell,
            commands::shell::list_available_shells,
            commands::shell::open_project_in_finder,
            commands::shell::open_project_in_vscode,
            commands::shell::open_project_in_terminal,
            commands::shell::launch_project_app,
            commands::terminal::run_project_command_template,
            commands::terminal::write_terminal_session,
            commands::terminal::resize_terminal_session,
            commands::terminal::kill_terminal_session,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
                app.state::<commands::terminal::TerminalManager>()
                    .kill_all();
            }
        });
}
