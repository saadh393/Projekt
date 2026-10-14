# Projekt — Application Plan

## 1. The Problem

As a developer juggling multiple clients and codebases, your projects are scattered across your filesystem with no single place to see them all. Every time you want to work on something you have to remember where it lives, open a terminal to that path, launch the right editor, and possibly run a startup command. Multiply that by 3 clients × 2–3 codebases each and it becomes real friction, every single day.

No existing tool solves this precisely. Finder doesn't know what a "project" is. Alfred/Raycast get close but are generic launchers, not project managers. VS Code's "recent" list mixes everything together. You need something opinionated around _your_ workflow.

---

## 2. What the App Does (Scope)

**Core loop:** Add a folder → assign it a category and tags → launch it however you want in one click.

### Features — Day One

| Feature                             | Detail                                                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project registry**                | Manually add any directory on disk as a project. Store a name, short description, path, category, tags, and color label.                                                         |
| **Two-level organisation**          | **Category** (Lucide icon + color, e.g. "Acme Corp" 🟠) owns multiple projects. **Tags** are flat labels within (e.g. `frontend`, `archived`). Sidebar groups by category.       |
| **Category management**             | Create/edit/delete categories. Assign any Lucide icon and a color. Set sort order. Hide/unhide from sidebar.                                                                     |
| **Hardcoded quick actions**         | Every project always shows three fixed action buttons: **Open in Finder**, **Open in VS Code**, **Open in Terminal**. These cannot be removed.                                   |
| **Custom app launchers**            | User defines additional launchers globally: label + `.app` path. These appear after the three hardcoded actions.                                                                 |
| **Global command templates**        | Reusable shell command templates (e.g. `npm run dev`). Any template can be pinned to a project.                                                                                  |
| **Command runner — smart terminal** | Running a template: first checks if a terminal window is already open → opens a new tab and runs there. If no terminal is running → opens a new window. Uses AppleScript on Mac. |
| **Project list controls**           | Sort by name / date added / last opened. Custom manual ordering (drag). Show/hide individual projects without deleting.                                                          |
| **Project search**                  | Fuzzy search across names, descriptions, paths, tags, and category names.                                                                                                        |
| **Persistent local storage**        | SQLite via `rusqlite`. Single file in the platform app-data directory. No sync, no cloud.                                                                                        |

### Deliberately Out of Scope

- Auto-scanning directories
- Git status / branch display
- Built-in terminal emulator
- Sync across machines

---

## 3. Technology Stack

### Backend — Rust + Tauri v2

| Concern            | Choice                                  | Why                                                                       |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------- |
| App framework      | Tauri v2                                | Native webview shell, tiny binary, proper Mac integration, cross-platform |
| Database           | `rusqlite` (SQLite)                     | Zero-config, single file, perfect for this data volume                    |
| Migrations         | `rusqlite_migration`                    | Simple, embedded SQL migrations                                           |
| Shell / process    | Tauri `shell` plugin                    | Sandboxed, cross-platform process spawning                                |
| Terminal (Mac)     | AppleScript via `osascript`             | Required for new-tab-in-existing-window behaviour                         |
| Terminal (Windows) | `wt.exe` (Windows Terminal) new-tab API | Cross-platform parity                                                     |
| Terminal (Linux)   | `xterm`/`gnome-terminal` with `--tab`   | Cross-platform parity                                                     |
| Serialization      | `serde` + `serde_json`                  | Standard                                                                  |
| Error handling     | `anyhow`                                | Clean propagation                                                         |

### Frontend — React + TypeScript

| Concern              | Choice                  | Why                                              |
| -------------------- | ----------------------- | ------------------------------------------------ |
| UI framework         | React 19 + Vite         | Fast dev loop                                    |
| Styling              | Tailwind CSS v4         | Utility-first, no runtime cost                   |
| Component primitives | Radix UI                | Accessible, unstyled, Mac-feel composable        |
| State                | Zustand                 | Minimal, no boilerplate                          |
| Data fetching        | `@tanstack/react-query` | Caching + invalidation for Tauri commands        |
| Icons                | `lucide-react`          | Used both in UI and user-assigned category icons |
| Drag & drop ordering | `@dnd-kit/core`         | Lightweight, accessible                          |

### Mac UI Patterns

- Sidebar (category list with icon + color) + main content pane — standard Mac three-pane layout
- Hardcoded action trio (Finder / VS Code / Terminal) as prominent toolbar buttons on every project
- Native window chrome, traffic lights in place
- Sidebar vibrancy via Tauri `vibrancy` option
- System font (`-apple-system`) throughout
- Keyboard shortcuts: `⌘K` search, `⌘N` new project, `⌘,` settings

---

