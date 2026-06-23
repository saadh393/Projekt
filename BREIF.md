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

## 4. Data Model

```
Category
  id            TEXT PRIMARY KEY  (ulid)
  name          TEXT NOT NULL
  icon          TEXT NOT NULL     (lucide icon name, e.g. "briefcase")
  color         TEXT NOT NULL     (hex)
  sort_order    INTEGER
  hidden        INTEGER DEFAULT 0 (boolean)
  created_at    INTEGER

Project
  id            TEXT PRIMARY KEY  (ulid)
  name          TEXT NOT NULL
  description   TEXT
  path          TEXT NOT NULL     (absolute filesystem path)
  category_id   TEXT              (FK → Category)
  color         TEXT              (hex, per-project accent dot)
  sort_order    INTEGER
  hidden        INTEGER DEFAULT 0 (boolean)
  pinned_commands TEXT            (JSON array of template ids)
  last_opened_at  INTEGER
  created_at    INTEGER
  updated_at    INTEGER

Tag
  id            TEXT PRIMARY KEY
  name          TEXT UNIQUE NOT NULL

ProjectTag
  project_id    TEXT
  tag_id        TEXT

AppLauncher                       (user-defined, beyond the hardcoded 3)
  id            TEXT PRIMARY KEY
  label         TEXT NOT NULL
  app_path      TEXT NOT NULL
  sort_order    INTEGER

CommandTemplate
  id            TEXT PRIMARY KEY
  label         TEXT NOT NULL
  command       TEXT NOT NULL
```

---

## 5. Terminal Command Runner Logic

The smart terminal behaviour, per platform:

**macOS (AppleScript)**

```
1. tell application "System Events" to get name of processes
2. If "Terminal" (or "iTerm2" / "Warp") is in the list:
     tell app "Terminal" to do script "cd /path && <command>" in front window
3. Else:
     tell app "Terminal" to do script "cd /path && <command>"
     (opens new window automatically)
```

The user's preferred terminal (Terminal.app / iTerm2 / Warp) is a single setting under Preferences → General. The AppleScript dialect differs slightly per app; the Rust command layer handles each variant.

**Windows:** `wt.exe --window 0 new-tab --startingDirectory "C:\path" cmd /k <command>` — `--window 0` targets existing window or opens new one if none.

**Linux:** `gnome-terminal --tab -- bash -c "cd /path && <command>; exec bash"` or equivalent based on detected terminal.

---

## 6. User Flow

```
Launch app
  └─ Sidebar: list of categories (icon + color + name), hidden ones collapsed
  └─ "All Projects" at top as a special filter
  └─ Main area: project cards/rows for selected category

Add a category (sidebar "+" button)
  └─ Popover: name, pick Lucide icon, pick color
  └─ Save → appears in sidebar immediately

Add a project (⌘N or "+" in main area)
  └─ Sheet slides in from right
  └─ Native folder picker → path auto-filled
  └─ Fill: name (auto from folder name), description, category, tags, color
  └─ Save → card appears in list

Project card / row
  └─ Shows: name, category badge, tags, description snippet, color dot
  └─ Three hardcoded action buttons always visible:
       [📁 Finder]  [⬛ VS Code]  [>_ Terminal]
  └─ Additional launchers appear after these three
  └─ Pinned command templates listed below with ▶ run button

Category sidebar controls (right-click or "..." menu)
  └─ Edit name / icon / color
  └─ Set sort order (drag or number input)
  └─ Hide from sidebar (still accessible via "All Projects")
  └─ Delete (with confirmation if projects exist inside)

Project list controls (toolbar above list)
  └─ Sort: Name A–Z / Date Added / Last Opened / Manual
  └─ Manual mode enables drag-to-reorder handles on cards
  └─ "Show hidden" toggle to reveal hidden projects
  └─ Right-click a project → Hide / Unhide

Settings (⌘,)
  └─ General tab: preferred terminal (Terminal.app / iTerm2 / Warp)
  └─ Launchers tab: add/remove/reorder custom .app launchers
  └─ Command Templates tab: add/remove/edit shell command templates
```

---

## 7. Project Structure

```
projekt/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── migrations.rs
│   │   │   └── schema.sql
│   │   ├── models/
│   │   │   ├── project.rs
│   │   │   ├── category.rs
│   │   │   ├── tag.rs
│   │   │   ├── launcher.rs
│   │   │   └── command_template.rs
│   │   └── commands/
│   │       ├── project.rs
│   │       ├── category.rs
│   │       ├── tag.rs
│   │       ├── launcher.rs
│   │       ├── command_template.rs
│   │       └── shell.rs        ← terminal + finder + vscode logic
│   └── tauri.conf.json
└── src/
    ├── components/
    │   ├── Sidebar/
    │   │   ├── Sidebar.tsx
    │   │   ├── CategoryItem.tsx
    │   │   └── CategoryMenu.tsx
    │   ├── ProjectList/
    │   │   ├── ProjectList.tsx
    │   │   ├── ProjectListToolbar.tsx
    │   │   └── ProjectCard.tsx
    │   ├── ProjectDetail/
    │   │   ├── ProjectDetail.tsx
    │   │   ├── ActionBar.tsx
    │   │   └── CommandRunner.tsx
    │   ├── Forms/
    │   │   ├── AddProjectSheet.tsx
    │   │   ├── AddCategoryPopover.tsx
    │   │   └── AddLauncherForm.tsx
    │   └── Settings/
    │       ├── Settings.tsx
    │       ├── GeneralTab.tsx
    │       ├── LaunchersTab.tsx
    │       └── CommandTemplatesTab.tsx
    ├── hooks/
    ├── stores/
    └── lib/
```

---

## 8. Suggestions

**Three things worth noting before you start:**

1. **Lucide icon picker UX.** There are 1,400+ Lucide icons. A searchable picker is essential — don't just render a grid. `lucide-react` exports icon names as strings so you can build a filtered list from the name index without loading all SVGs at once. Plan this component early; it's the most non-trivial UI piece.

2. **`last_opened_at` is worth tracking from day one.** Every time any of the three hardcoded actions fires, write a timestamp. "Sort by last opened" becomes your most-used sort within a week — it naturally floats active projects to the top without any manual reordering.

3. **AppleScript + Warp behave differently.** Warp doesn't fully support AppleScript the same way Terminal.app and iTerm2 do. The reliable cross-terminal approach on Mac is to detect the running terminal process name, then dispatch to the right script variant. Keep that logic isolated in `shell.rs` behind a clean enum so adding a new terminal later is a one-function change.
