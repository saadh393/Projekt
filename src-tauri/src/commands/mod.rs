pub mod category;
pub mod command_template;
pub mod launcher;
pub mod project;
pub mod shell;
pub mod tag;

pub fn command_error(error: anyhow::Error) -> String {
    error.to_string()
}
