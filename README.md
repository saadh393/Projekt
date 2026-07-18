<p align="center">
  <img src="src/public/logo.png" alt="Projekt" width="96" />
</p>

<h1 align="center">Projekt</h1>

<p align="center">
  A focused macOS desktop app for organizing local development projects, launchers, commands, and workspaces in one place.
</p>

<p align="center">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2.x-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Rust" src="https://img.shields.io/badge/Rust-native-000000?style=for-the-badge&logo=rust&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-local-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

<p align="center">
  <img alt="macOS" src="https://img.shields.io/badge/macOS-Apple%20Silicon%20ready-000000?style=flat-square&logo=apple&logoColor=white" />
  <img alt="Desktop" src="https://img.shields.io/badge/Desktop-Tauri%20App-blue?style=flat-square" />
  <img alt="Storage" src="https://img.shields.io/badge/Storage-Local%20Only-brightgreen?style=flat-square" />
</p>

---

## Overview

Projekt is built for developers who jump between many local codebases every day. Instead of remembering folders, terminal commands, app launchers, and project context manually, Projekt gives you a clean native desktop workspace for the whole loop:

Add a folder, organize it, then open it in Finder, VS Code, Terminal, or your own custom launcher with one click.

## Screenshots

### Project Workspace

![Projekt home screen](screenshorts/home-screen.png)

### Project Details

![Projekt project details](screenshorts/project-details.png)

## Installation

### Download

Pre-built binaries are published on the [Releases page](https://github.com/saadh393/Projekt/releases).

> Projekt is distributed independently — not through the Mac App Store and not
> notarized by Apple — so macOS Gatekeeper will warn that the app is "from an
> unidentified developer" on first launch. This is expected. Use one of the
> options below to open it. The prompt appears only once.

### Verify the download (optional)

Every release ships a `.sha256` checksum file alongside each artifact. Verify
before installing:

```sh
shasum -a 256 -c Projekt_<version>_aarch64.dmg.sha256
```

### Open on macOS

After mounting the DMG and dragging **Projekt** into **Applications**, pick one
of these on first launch:

**Option A — Right-click → Open (fastest)**

1. In Finder, right-click (or Control-click) **Projekt** in Applications.
2. Choose **Open**.
3. Confirm **Open** in the prompt. The warning won't reappear for this app.

**Option B — System Settings (macOS Ventura and later)**

1. Double-click Projekt. Dismiss the "cannot verify the developer" dialog.
2. Open **System Settings → Privacy & Security**.
3. Scroll down and click **Open Anyway** next to the Projekt notice, then confirm.

**Option C — Terminal (one-shot)**

```sh
xattr -dr com.apple.quarantine /Applications/Projekt.app
```

This strips the Gatekeeper quarantine flag from the bundle entirely.

## Features

- Project registry for local folders with name, description, path, tags, category, color, and pinned commands.
- Category-based organization with Lucide icons, colors, hidden states, and project counts.
- Fast project search across names, descriptions, paths, tags, and category names.
- Built-in actions for Finder, VS Code, and Terminal.
- Custom macOS app launchers for additional `.app` targets.
- Reusable command templates that can be pinned to projects and run from the detail panel.
- Smart terminal execution for project commands.
- Manual reordering, hidden projects, and last-opened sorting.
- Local-first persistence with SQLite. No sync, no cloud, no account.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop shell | Tauri v2 |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI |
| State | Zustand, TanStack Query |
| Backend | Rust |
| Database | SQLite with `rusqlite` |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js
- Rust
- macOS for the current desktop build workflow
- Xcode Command Line Tools on macOS

Install dependencies:

```sh
npm install
```

Run the web app:

```sh
npm run dev
```

Run the desktop app:

```sh
npm run tauri:dev
```

## Build

Build the frontend:

```sh
npm run build
```

Build the desktop app:

```sh
npm run tauri:build
```

Build an Apple Silicon DMG:

```sh
npm run tauri build -- --target aarch64-apple-darwin --bundles dmg
```

The generated macOS release artifact is written to:

```txt
src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/
```

## Project Structure

```txt
src/
  components/      React UI grouped by feature
  hooks/           React Query and UI behavior hooks
  lib/             API wrappers, helpers, and shared types
  store/           Zustand UI state

src-tauri/
  src/commands/    Tauri commands for projects, categories, launchers, shell actions
  src/db/          SQLite connection and migrations
  src/models/      Rust data models
  tauri.conf.json  Desktop app and bundle configuration
```

## Roadmap

- Better command editing workflows.
- Launcher reordering.
- Category drag reordering.
- Expanded cross-platform launcher support.
- Signed and notarized release pipeline.

## Contributing

Contributions are welcome. Keep changes focused, preserve the native macOS feel, and prefer simple, reusable modules over large mixed-purpose files.

Before opening a pull request:

```sh
npm run build
cd src-tauri
cargo check
```

## License

Add a license before publishing this repository publicly.
