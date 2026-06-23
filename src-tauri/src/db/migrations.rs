use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub fn run(connection: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![M::up(include_str!("schema.sql"))]);

    migrations.to_latest(connection)
}
