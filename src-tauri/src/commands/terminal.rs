use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;

use portable_pty::{native_pty_system, ChildKiller, CommandBuilder, MasterPty, PtySize};
use rusqlite::{named_params, OptionalExtension};
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

use crate::commands::command_error;
use crate::commands::project::mark_project_opened;
use crate::commands::shell::{open_terminal, preferred_shell, preferred_terminal, PreferredShell};
use crate::db::id::new_id;
use crate::db::Database;
use crate::models::command_template::CommandExecutionTarget;

#[derive(Default)]
pub struct TerminalManager {
    sessions: Arc<Mutex<HashMap<String, TerminalProcess>>>,
}

struct TerminalProcess {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
    killer: Box<dyn ChildKiller + Send + Sync>,
    #[cfg(windows)]
    process_id: Option<u32>,
    #[cfg(unix)]
    process_group_id: Option<i32>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSession {
    id: String,
    project_id: String,
    label: String,
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum CommandRunResult {
    External,
    Embedded { session: TerminalSession },
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalOutput {
    session_id: String,
    data: Vec<u8>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalExit {
    session_id: String,
    exit_code: u32,
}

struct CommandDefinition {
    label: String,
    project_name: String,
    command: String,
    path: String,
    execution_target: CommandExecutionTarget,
}

#[tauri::command]
pub fn run_project_command_template(
    app: AppHandle,
    db: State<'_, Database>,
    manager: State<'_, TerminalManager>,
    project_id: String,
    template_id: String,
) -> Result<CommandRunResult, String> {
    let definition = command_definition(&db, &project_id, &template_id).map_err(command_error)?;

    let result = match definition.execution_target {
        CommandExecutionTarget::External => {
            let terminal = preferred_terminal(&db).map_err(command_error)?;
            open_terminal(&app, &definition.path, Some(&definition.command), terminal)
                .map_err(command_error)?;
            CommandRunResult::External
        }
        CommandExecutionTarget::Embedded => {
            let shell = preferred_shell(&db).map_err(command_error)?;
            let session = manager
                .start(
                    app,
                    project_id.clone(),
                    format!("{} · {}", definition.project_name, definition.label),
                    definition.path,
                    definition.command,
                    shell,
                )
                .map_err(command_error)?;
            CommandRunResult::Embedded { session }
        }
    };

    db.with_connection(|connection| mark_project_opened(connection, &project_id))
        .map_err(command_error)?;
    Ok(result)
}

#[tauri::command]
pub fn write_terminal_session(
    manager: State<'_, TerminalManager>,
    session_id: String,
    data: Vec<u8>,
) -> Result<(), String> {
    manager.write(&session_id, &data).map_err(command_error)
}

#[tauri::command]
pub fn resize_terminal_session(
    manager: State<'_, TerminalManager>,
    session_id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    manager
        .resize(&session_id, rows, cols)
        .map_err(command_error)
}

#[tauri::command]
pub fn kill_terminal_session(
    manager: State<'_, TerminalManager>,
    session_id: String,
) -> Result<(), String> {
    manager.kill(&session_id).map_err(command_error)
}

impl TerminalManager {
    fn start(
        &self,
        app: AppHandle,
        project_id: String,
        label: String,
        path: String,
        command: String,
        shell: PreferredShell,
    ) -> anyhow::Result<TerminalSession> {
        let session_id = new_id();
        let pair = native_pty_system().openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        let mut command_builder = shell_command(shell, &command);
        command_builder.cwd(path);
        let mut child = pair.slave.spawn_command(command_builder)?;
        #[cfg(windows)]
        let process_id = child.process_id();
        let killer = child.clone_killer();
        let mut reader = pair.master.try_clone_reader()?;
        let writer = pair.master.take_writer()?;
        #[cfg(unix)]
        let process_group_id = pair.master.process_group_leader();

        self.sessions.lock().map_err(lock_error)?.insert(
            session_id.clone(),
            TerminalProcess {
                master: pair.master,
                writer,
                killer,
                #[cfg(windows)]
                process_id,
                #[cfg(unix)]
                process_group_id,
            },
        );

        let output_session_id = session_id.clone();
        let output_app = app.clone();
        thread::spawn(move || read_output(&mut reader, &output_app, &output_session_id));

        let exit_session_id = session_id.clone();
        thread::spawn(move || {
            let exit_code = child.wait().map(|status| status.exit_code()).unwrap_or(1);
            let _ = app.emit(
                "terminal-exit",
                TerminalExit {
                    session_id: exit_session_id,
                    exit_code,
                },
            );
        });

        Ok(TerminalSession {
            id: session_id,
            project_id,
            label,
        })
    }

    fn write(&self, session_id: &str, data: &[u8]) -> anyhow::Result<()> {
        let mut sessions = self.sessions.lock().map_err(lock_error)?;
        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("terminal session not found"))?;
        session.writer.write_all(data)?;
        session.writer.flush()?;
        Ok(())
    }

    fn resize(&self, session_id: &str, rows: u16, cols: u16) -> anyhow::Result<()> {
        let sessions = self.sessions.lock().map_err(lock_error)?;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| anyhow::anyhow!("terminal session not found"))?;
        session.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        Ok(())
    }

    fn kill(&self, session_id: &str) -> anyhow::Result<()> {
        let mut session = self
            .sessions
            .lock()
            .map_err(lock_error)?
            .remove(session_id)
            .ok_or_else(|| anyhow::anyhow!("terminal session not found"))?;
        kill_process_tree(&mut session)
    }

    pub fn kill_all(&self) {
        let sessions = self
            .sessions
            .lock()
            .map(|mut sessions| {
                sessions
                    .drain()
                    .map(|(_, session)| session)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        for mut session in sessions {
            let _ = kill_process_tree(&mut session);
        }
    }
}

fn command_definition(
    db: &Database,
    project_id: &str,
    template_id: &str,
) -> anyhow::Result<CommandDefinition> {
    db.with_connection(|connection| {
        connection
            .query_row(
                "SELECT c.label, c.command, c.execution_target, p.name AS project_name, p.path
                 FROM command_templates c
                 JOIN projects p ON p.id = :project_id
                 WHERE c.id = :template_id
                 AND (c.project_id IS NULL OR c.project_id = :project_id)",
                named_params! {
                    ":project_id": project_id,
                    ":template_id": template_id,
                },
                |row| {
                    Ok(CommandDefinition {
                        label: row.get("label")?,
                        project_name: row.get("project_name")?,
                        command: row.get("command")?,
                        execution_target: CommandExecutionTarget::from_str(
                            &row.get::<_, String>("execution_target")?,
                        ),
                        path: row.get("path")?,
                    })
                },
            )
            .optional()?
            .ok_or_else(|| anyhow::anyhow!("command template not found for project"))
    })
}

fn shell_command(shell: PreferredShell, command: &str) -> CommandBuilder {
    match shell {
        PreferredShell::Bash => login_shell_command("bash", command),
        PreferredShell::Zsh => login_shell_command("zsh", command),
        PreferredShell::Powershell => {
            let mut builder = CommandBuilder::new("powershell.exe");
            builder.args(["-NoLogo", "-Command", command]);
            builder
        }
        PreferredShell::Cmd => {
            let mut builder = CommandBuilder::new("cmd.exe");
            builder.args(["/C", command]);
            builder
        }
    }
}

fn login_shell_command(shell: &str, command: &str) -> CommandBuilder {
    let mut builder = CommandBuilder::new(shell);
    builder.args(["-lic", command]);
    builder
}

fn read_output(reader: &mut dyn Read, app: &AppHandle, session_id: &str) {
    let mut buffer = [0_u8; 8192];

    while let Ok(size) = reader.read(&mut buffer) {
        if size == 0 {
            break;
        }

        let _ = app.emit(
            "terminal-output",
            TerminalOutput {
                session_id: session_id.to_string(),
                data: buffer[..size].to_vec(),
            },
        );
    }
}

#[cfg(unix)]
fn kill_process_tree(session: &mut TerminalProcess) -> anyhow::Result<()> {
    if let Some(process_group_id) = session.process_group_id {
        let result = unsafe { libc::kill(-process_group_id, libc::SIGKILL) };
        if result == 0 || std::io::Error::last_os_error().raw_os_error() == Some(libc::ESRCH) {
            return Ok(());
        }
    }

    session.killer.kill().map_err(Into::into)
}

#[cfg(windows)]
fn kill_process_tree(session: &mut TerminalProcess) -> anyhow::Result<()> {
    if let Some(process_id) = session.process_id {
        let status = std::process::Command::new("taskkill")
            .args(["/PID", &process_id.to_string(), "/T", "/F"])
            .status()?;
        if status.success() {
            return Ok(());
        }
    }

    session.killer.kill().map_err(Into::into)
}

fn lock_error<T>(error: std::sync::PoisonError<T>) -> anyhow::Error {
    anyhow::anyhow!(error.to_string())
}
