# Projekt — UI Layout

## Application Window

The window follows a standard Mac two-pane layout. The left side is a narrow sidebar. The right side is the main content area. There is no third detail pane — project details expand inline or in a sheet overlay, keeping the layout simple.

---

## Sidebar (Left Pane)

The sidebar is fixed width, roughly 220px. It has a subtle frosted glass / vibrancy background, slightly darker than the main content area. The top of the sidebar has the app name or logo, and a small "+" button aligned to the right to create a new category.

Below that is a search bar that spans the full sidebar width. Typing here triggers fuzzy search across everything.

Below the search bar is the navigation list:

- **All Projects** is always the first item, pinned at the top. It shows a count of total projects.
- Then each **Category** is listed as a row. Each row shows the category's Lucide icon on the left rendered in the category's assigned color, then the category name, then a faint project count on the right.
- Categories are ordered by their sort order. Hidden categories do not appear unless the user toggles "Show hidden" at the bottom.
- Right-clicking a category row opens a small context menu with: Edit, Reorder, Hide, and Delete.
- At the very bottom of the sidebar there is a small gear icon that opens Settings, and a faint "Show hidden categories" toggle.

---

## Main Content Area (Right Pane)

### Toolbar Strip

At the very top of the main pane is a thin toolbar. On the left it shows the current category name and icon as a heading. On the right side of the toolbar there are controls:

- A view toggle: **Grid** (cards) or **List** (rows)
- A sort dropdown: Name A–Z, Date Added, Last Opened, Manual
- When sort is set to Manual, a drag handle icon appears on each project item
- A "Show hidden" toggle button
- A "+" button to add a new project into the current category

### Project Grid View

When in grid mode, projects are displayed as cards in a responsive multi-column grid. Each card contains:

- A color accent bar or dot at the top left in the project's assigned color
- The project name in medium weight, prominent
- The category badge below the name, shown as a small pill with the category icon and name
- Tags listed as small flat chips below the category badge
- A short description snippet, one or two lines, in muted text
- The filesystem path in very small monospace text at the bottom of the card
- The three hardcoded action buttons along the bottom of the card as icon-only buttons with tooltips: Finder icon, VS Code icon, Terminal icon. If there are custom launchers, they appear after these three in the same row, truncating with a "more" overflow button if too many.

### Project List View

When in list mode, projects are displayed as full-width rows. Each row contains:

- The color dot on the far left
- Project name and description as a two-line stack
- Category badge and tags in the middle column
- The filesystem path in small monospace in a middle column
- The three hardcoded action buttons on the far right as compact icon buttons
- A "..." overflow button on the far right for secondary actions: Edit, Pin/Unpin, Hide, Delete

### Empty State

When a category has no projects, the main area shows a centered illustration or simple icon with the text "No projects yet" and a prominent "Add Project" button.

---

## Add / Edit Project — Sheet Overlay

Clicking "+" or editing a project slides in a sheet from the right side of the window. It does not take over the full window. It is roughly 420px wide and overlays the main content with a dimmed backdrop.

The sheet contains, from top to bottom:

- A close button (X) in the top right corner
- Heading: "Add Project" or "Edit Project"
- **Path field** — a read-only text input showing the selected folder path, with a "Browse" button that opens the native Mac folder picker. This is the first field because everything else can be inferred from it.
- **Name field** — text input, auto-filled from the folder name, editable
- **Description field** — multi-line textarea, optional
- **Category dropdown** — select from existing categories, or an inline "Create new category" option at the bottom of the dropdown list
- **Tags field** — a tag input that allows typing to create new tags or selecting existing ones. Tags appear as removable chips inside the input.
- **Color picker** — a row of 8–10 preset color swatches to assign a color accent to the project. One is selected by default.
- **Pinned Commands** — a list of global command templates with checkboxes. Checked ones will appear as runnable commands on the project card.
- A full-width **Save** button at the bottom of the sheet

---

## Add / Edit Category — Popover

This is a small popover, not a full sheet. It appears anchored near the "+" button in the sidebar. It contains:

- **Name field** — short text input
- **Icon picker** — a compact searchable grid of Lucide icons. There is a small search input at the top of the grid. Icons render at about 20px in a 6-column grid. The selected icon gets a highlighted border.
- **Color picker** — same preset swatch row as the project color picker
- A **Save** button

The popover closes on save or clicking outside.

---

## Project — Pinned Commands Section

On each project card (in grid view, this is accessible via a chevron expand) or as a section in list view rows, there is a "Commands" area. It lists the command templates that have been pinned to this project. Each entry shows:

- The command label (e.g. "Start Dev Server")
- The actual command in small monospace text (e.g. `npm run dev`)
- A play button on the right

Clicking the play button triggers the smart terminal logic: find existing terminal window → open new tab and run. If none open → open new window and run.

---

## Settings Window

Settings open as a separate child window (not a sheet), following Mac convention. It has a top segmented tab bar with three tabs:

**General tab**

- Preferred terminal: a dropdown with Terminal.app, iTerm2, Warp
- Nothing else for now

**Launchers tab**

- A list of user-defined custom app launchers. Each row shows the label, the .app path, and a drag handle for reordering, plus a delete button.
- An "Add Launcher" button at the bottom opens a small inline form: label input, .app path input with a Browse button to pick from Applications.

**Command Templates tab**

- A list of all global command templates. Each row shows the label, the shell command in monospace, a drag handle, an edit button, and a delete button.
- An "Add Template" button at the bottom opens an inline form: label input and command input.

---

## Contextual Behaviours

- Right-clicking any project card or row opens a context menu: Open in Finder, Open in VS Code, Open in Terminal, Edit, Hide, Delete.
- The three hardcoded action buttons on every project are always the same order and always visible — never hidden, never reorderable.
- Hidden projects are visually faded with a strikethrough on the name when "Show hidden" is toggled on, rather than disappearing entirely, so you can unhide them.
- Sort order set to Manual reveals a drag handle on the left edge of every card or row. Dragging reorders within the current category view only.
- The sidebar category list is also drag-reorderable when you hover over any category row and a drag handle appears on the left.
