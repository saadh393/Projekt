# Codebase Overview

Projekt is a Tauri v2 desktop app with a React 19 + TypeScript frontend and a Rust + SQLite backend. The app manages local project folders, categories, tags, launchers, and command templates.

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | React entrypoint. |
| `src/App.tsx` | App providers and top-level shell mount. |
| `src/components/` | UI components split by feature area. |
| `src/components/Sidebar/` | Category navigation, category menu, category creation. |
| `src/components/ProjectList/` | Search, sorting, hidden toggle, project cards, manual ordering. |
| `src/components/ProjectDetail/` | Selected project actions, metadata, pinned command runner. |
| `src/components/Forms/` | Project, category, and launcher forms. |
| `src/components/Settings/` | Settings modal tabs for terminal, launchers, command templates. |
| `src/hooks/` | React Query hooks and keyboard shortcuts. |
| `src/lib/` | API wrapper, types, constants, pure helpers. |
| `src/store/` | Zustand UI state. |
| `src/styles.css` | Global Tailwind import and shared UI polish. |
| `src-tauri/src/main.rs` | Native app entrypoint. |
| `src-tauri/src/lib.rs` | Tauri builder, plugins, command registration. |
| `src-tauri/src/db/` | SQLite connection, migrations, ID generation. |
| `src-tauri/src/models/` | Rust data models and row mapping. |
| `src-tauri/src/commands/` | Tauri commands for CRUD and shell actions. |
| `src-tauri/src/commands/shell.rs` | Finder, VS Code, terminal, launcher, and command execution. |
| `src-tauri/src/db/schema.sql` | SQLite schema. |
| `src-tauri/tauri.conf.json` | Tauri app and window config. |
| `RUN.md` | Install, run, check, and build commands. |
