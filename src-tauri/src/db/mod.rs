pub mod id;
pub mod migrations;

use std::fs;
use std::path::Path;
use std::sync::Mutex;

use rusqlite::Connection;

pub struct Database {
    connection: Mutex<Connection>,
}

impl Database {
    pub fn open(app_data_dir: &Path) -> anyhow::Result<Self> {
        fs::create_dir_all(app_data_dir)?;

        let db_path = app_data_dir.join("projekt.sqlite3");
        let mut connection = Connection::open(db_path)?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        migrations::run(&mut connection)?;

        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    pub fn with_connection<T>(
        &self,
        action: impl FnOnce(&Connection) -> anyhow::Result<T>,
    ) -> anyhow::Result<T> {
        let connection = self
            .connection
            .lock()
            .map_err(|_| anyhow::anyhow!("database lock poisoned"))?;

        action(&connection)
    }

    pub fn with_transaction<T>(
        &self,
        action: impl FnOnce(&rusqlite::Transaction<'_>) -> anyhow::Result<T>,
    ) -> anyhow::Result<T> {
        let mut connection = self
            .connection
            .lock()
            .map_err(|_| anyhow::anyhow!("database lock poisoned"))?;
        let transaction = connection.transaction()?;
        let result = action(&transaction)?;

        transaction.commit()?;

        Ok(result)
    }
}

pub fn now_timestamp() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or_default()
}
