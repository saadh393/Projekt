use rusqlite::{named_params, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_shell::ShellExt;

use crate::commands::command_error;
use crate::commands::project::mark_project_opened;
use crate::db::Database;

const PREFERRED_TERMINAL_KEY: &str = "preferred_terminal";
const PREFERRED_SHELL_KEY: &str = "preferred_shell";

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PreferredTerminal {
    Terminal,
    #[serde(rename = "iterm2")]
    ITerm2,
    Warp,
}

impl PreferredTerminal {
    fn as_str(self) -> &'static str {
        match self {
            Self::Terminal => "terminal",
            Self::ITerm2 => "iterm2",
            Self::Warp => "warp",
        }
    }

    fn from_str(value: &str) -> Self {
        match value {
            "iterm2" => Self::ITerm2,
            "warp" => Self::Warp,
            _ => Self::Terminal,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PreferredShell {
    Bash,
    Zsh,
    Powershell,
    Cmd,
}

impl PreferredShell {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Bash => "bash",
            Self::Zsh => "zsh",
            Self::Powershell => "powershell",
            Self::Cmd => "cmd",
        }
    }

    fn from_str(value: &str) -> Self {
        available_shells()
            .into_iter()
            .find(|shell| shell.as_str() == value)
            .unwrap_or_else(default_shell)
    }
}

#[tauri::command]
pub fn get_preferred_shell(db: State<'_, Database>) -> Result<PreferredShell, String> {
    preferred_shell(&db).map_err(command_error)
}

#[tauri::command]
pub fn set_preferred_shell(
    db: State<'_, Database>,
    shell: PreferredShell,
) -> Result<PreferredShell, String> {
    if !available_shells()
        .iter()
        .any(|available| available.as_str() == shell.as_str())
    {
        return Err("shell is not available on this operating system".to_string());
    }

    db.with_connection(|connection| {
        connection.execute(
            "INSERT INTO preferences (key, value)
             VALUES (:key, :value)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            named_params! {
                ":key": PREFERRED_SHELL_KEY,
                ":value": shell.as_str(),
            },
        )?;

        Ok(shell)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn list_available_shells() -> Vec<PreferredShell> {
    available_shells()
}

#[tauri::command]
pub fn get_preferred_terminal(db: State<'_, Database>) -> Result<PreferredTerminal, String> {
    db.with_connection(|connection| {
        let value = connection
            .query_row(
                "SELECT value FROM preferences WHERE key = :key",
                named_params! { ":key": PREFERRED_TERMINAL_KEY },
                |row| row.get::<_, String>("value"),
            )
            .optional()?;

        Ok(value
            .as_deref()
            .map(PreferredTerminal::from_str)
            .unwrap_or(PreferredTerminal::Terminal))
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn set_preferred_terminal(
    db: State<'_, Database>,
    terminal: PreferredTerminal,
) -> Result<PreferredTerminal, String> {
    db.with_connection(|connection| {
        connection.execute(
            "INSERT INTO preferences (key, value)
             VALUES (:key, :value)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            named_params! {
                ":key": PREFERRED_TERMINAL_KEY,
                ":value": terminal.as_str(),
            },
        )?;

        Ok(terminal)
    })
    .map_err(command_error)
}

#[tauri::command]
pub fn open_project_in_finder(
    app: AppHandle,
    db: State<'_, Database>,
    project_id: String,
) -> Result<(), String> {
    let path = project_path(&db, &project_id).map_err(command_error)?;
    open_path(&app, &path).map_err(command_error)?;
    mark_opened(&db, &project_id).map_err(command_error)
}

#[tauri::command]
pub fn open_project_in_vscode(
    app: AppHandle,
    db: State<'_, Database>,
    project_id: String,
) -> Result<(), String> {
    let path = project_path(&db, &project_id).map_err(command_error)?;
    open_vscode(&app, &path).map_err(command_error)?;
    mark_opened(&db, &project_id).map_err(command_error)
}

#[tauri::command]
pub fn open_project_in_antigravity(
    app: AppHandle,
    db: State<'_, Database>,
    project_id: String,
) -> Result<(), String> {
    let path = project_path(&db, &project_id).map_err(command_error)?;
    open_antigravity(&app, &path).map_err(command_error)?;
    mark_opened(&db, &project_id).map_err(command_error)
}

#[tauri::command]
pub fn open_project_in_terminal(
    app: AppHandle,
    db: State<'_, Database>,
    project_id: String,
) -> Result<(), String> {
    let path = project_path(&db, &project_id).map_err(command_error)?;
    let terminal = preferred_terminal(&db).map_err(command_error)?;
    open_terminal(&app, &path, None, terminal).map_err(command_error)?;
    mark_opened(&db, &project_id).map_err(command_error)
}

#[tauri::command]
pub fn launch_project_app(
    app: AppHandle,
    db: State<'_, Database>,
    project_id: String,
    launcher_id: String,
) -> Result<(), String> {
    let path = project_path(&db, &project_id).map_err(command_error)?;
    let app_path = launcher_path(&db, &launcher_id).map_err(command_error)?;
    open_launcher(&app, &app_path, &path).map_err(command_error)?;
    mark_opened(&db, &project_id).map_err(command_error)
}

fn project_path(db: &Database, project_id: &str) -> anyhow::Result<String> {
    db.with_connection(|connection| {
        connection
            .query_row(
                "SELECT path FROM projects WHERE id = :id",
                named_params! { ":id": project_id },
                |row| row.get::<_, String>("path"),
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("project not found"))
    })
}

fn launcher_path(db: &Database, launcher_id: &str) -> anyhow::Result<String> {
    db.with_connection(|connection| {
        connection
            .query_row(
                "SELECT app_path FROM app_launchers WHERE id = :id",
                named_params! { ":id": launcher_id },
                |row| row.get::<_, String>("app_path"),
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("app launcher not found"))
    })
}

pub(crate) fn preferred_terminal(db: &Database) -> anyhow::Result<PreferredTerminal> {
    db.with_connection(|connection| {
        let value = connection
            .query_row(
                "SELECT value FROM preferences WHERE key = :key",
                named_params! { ":key": PREFERRED_TERMINAL_KEY },
                |row| row.get::<_, String>("value"),
            )
            .optional()?;

        Ok(value
            .as_deref()
            .map(PreferredTerminal::from_str)
            .unwrap_or(PreferredTerminal::Terminal))
    })
}

pub(crate) fn preferred_shell(db: &Database) -> anyhow::Result<PreferredShell> {
    db.with_connection(|connection| {
        let value = connection
            .query_row(
                "SELECT value FROM preferences WHERE key = :key",
                named_params! { ":key": PREFERRED_SHELL_KEY },
                |row| row.get::<_, String>("value"),
            )
            .optional()?;

        Ok(value
            .as_deref()
            .map(PreferredShell::from_str)
            .unwrap_or_else(default_shell))
    })
}

fn default_shell() -> PreferredShell {
    #[cfg(target_os = "windows")]
    {
        PreferredShell::Powershell
    }

    #[cfg(target_os = "macos")]
    {
        PreferredShell::Zsh
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        PreferredShell::Bash
    }
}

fn available_shells() -> Vec<PreferredShell> {
    #[cfg(target_os = "windows")]
    {
        vec![PreferredShell::Powershell, PreferredShell::Cmd]
    }

    #[cfg(target_os = "macos")]
    {
        vec![PreferredShell::Zsh, PreferredShell::Bash]
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        vec![PreferredShell::Bash, PreferredShell::Zsh]
    }
}

fn mark_opened(db: &Database, project_id: &str) -> anyhow::Result<()> {
    db.with_connection(|connection| mark_project_opened(connection, project_id))
}

fn open_path(app: &AppHandle, path: &str) -> anyhow::Result<()> {
    #[cfg(target_os = "macos")]
    {
        return spawn(app, "open", vec![path.to_string()]);
    }

    #[cfg(target_os = "windows")]
    {
        return spawn(app, "explorer", vec![path.to_string()]);
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        return spawn(app, "xdg-open", vec![path.to_string()]);
    }
}

fn open_vscode(app: &AppHandle, path: &str) -> anyhow::Result<()> {
    #[cfg(target_os = "macos")]
    {
        return spawn(
            app,
            "open",
            vec![
                "-a".to_string(),
                "Visual Studio Code".to_string(),
                path.to_string(),
            ],
        );
    }

    #[cfg(not(target_os = "macos"))]
    {
        return spawn(app, "code", vec![path.to_string()]);
    }
}

fn open_antigravity(app: &AppHandle, path: &str) -> anyhow::Result<()> {
    #[cfg(target_os = "macos")]
    {
        return spawn(
            app,
            "open",
            vec![
                "-a".to_string(),
                "Antigravity IDE".to_string(),
                path.to_string(),
            ],
        );
    }

    #[cfg(not(target_os = "macos"))]
    {
        return spawn(app, "agy", vec![path.to_string()]);
    }
}

fn open_launcher(app: &AppHandle, app_path: &str, project_path: &str) -> anyhow::Result<()> {
    #[cfg(target_os = "macos")]
    {
        return spawn(
            app,
            "open",
            vec![
                "-a".to_string(),
                app_path.to_string(),
                project_path.to_string(),
            ],
        );
    }

    #[cfg(not(target_os = "macos"))]
    {
        return spawn(app, app_path, vec![project_path.to_string()]);
    }
}

pub(crate) fn open_terminal(
    app: &AppHandle,
    path: &str,
    command: Option<&str>,
    terminal: PreferredTerminal,
) -> anyhow::Result<()> {
    #[cfg(target_os = "macos")]
    {
        let script = mac_terminal_script(terminal, path, command);
        return spawn(app, "osascript", vec!["-e".to_string(), script]);
    }

    #[cfg(target_os = "windows")]
    {
        let mut args = vec![
            "--window".to_string(),
            "0".to_string(),
            "new-tab".to_string(),
            "--startingDirectory".to_string(),
            path.to_string(),
            "cmd".to_string(),
            "/k".to_string(),
        ];
        if let Some(command) = command.map(str::trim).filter(|command| !command.is_empty()) {
            args.push(command.to_string());
        }

        return spawn(app, "wt.exe", args);
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        let command_line = terminal_command_line(path, command);
        let script = format!(
            "if command -v gnome-terminal >/dev/null 2>&1; then gnome-terminal --tab -- bash -lc {}; elif command -v xterm >/dev/null 2>&1; then xterm -e bash -lc {}; else x-terminal-emulator -e bash -lc {}; fi",
            shell_quote(&format!("{command_line}; exec bash")),
            shell_quote(&format!("{command_line}; exec bash")),
            shell_quote(&format!("{command_line}; exec bash"))
        );

        return spawn(app, "sh", vec!["-lc".to_string(), script]);
    }
}

#[cfg(target_os = "macos")]
fn mac_terminal_script(terminal: PreferredTerminal, path: &str, command: Option<&str>) -> String {
    match terminal {
        PreferredTerminal::Terminal => terminal_app_script(path, command),
        PreferredTerminal::ITerm2 => iterm_script(path, command),
        PreferredTerminal::Warp => warp_script(path, command),
    }
}

#[cfg(target_os = "macos")]
fn terminal_app_script(path: &str, command: Option<&str>) -> String {
    let command = applescript_quote(&terminal_command_line(path, command));

    format!(
        r#"tell application "System Events"
  set isRunning to (name of processes) contains "Terminal"
end tell
if isRunning then
  tell application "Terminal"
    activate
    if (count of windows) > 0 then
      do script "{command}" in front window
    else
      do script "{command}"
    end if
  end tell
else
  tell application "Terminal"
    activate
    do script "{command}"
  end tell
end if"#
    )
}

#[cfg(target_os = "macos")]
fn iterm_script(path: &str, command: Option<&str>) -> String {
    let command = applescript_quote(&terminal_command_line(path, command));

    format!(
        r#"tell application "System Events"
  set isRunning to (name of processes) contains "iTerm2"
end tell
tell application "iTerm2"
  activate
  if isRunning and (count of windows) > 0 then
    tell current window
      create tab with default profile
      tell current session to write text "{command}"
    end tell
  else
    create window with default profile
    tell current session of current window to write text "{command}"
  end if
end tell"#
    )
}

#[cfg(target_os = "macos")]
fn warp_script(path: &str, command: Option<&str>) -> String {
    let command = applescript_quote(&terminal_command_line(path, command));

    format!(
        r#"tell application "System Events"
  set isRunning to (name of processes) contains "Warp"
end tell
tell application "Warp" to activate
delay 0.2
tell application "System Events"
  if isRunning then
    keystroke "t" using command down
    delay 0.1
  end if
  keystroke "{command}"
  key code 36
end tell"#
    )
}

fn terminal_command_line(path: &str, command: Option<&str>) -> String {
    match command.map(str::trim).filter(|command| !command.is_empty()) {
        Some(command) => format!("cd {} && {}", shell_quote(path), command),
        None => format!("cd {}", shell_quote(path)),
    }
}

fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}

#[cfg(target_os = "macos")]
fn applescript_quote(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

fn spawn(app: &AppHandle, program: &str, args: Vec<String>) -> anyhow::Result<()> {
    app.shell()
        .command(program)
        .args(args)
        .spawn()
        .map(|_| ())
        .map_err(|error| anyhow::anyhow!(error.to_string()))
}
