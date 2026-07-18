# Run And Build

## Install

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
. "$HOME/.cargo/env"
npm install --no-package-lock --ignore-scripts
```

## Run Web

```sh
npm run dev
```

## Run Desktop App

````sh
. "$HOME/.cargo/env"
npm run tauri:dev ```

## Build Web

```sh
npm run build
````

## Check Rust

```sh
. "$HOME/.cargo/env"
cd src-tauri
cargo check
```

## Build Desktop App

```sh
. "$HOME/.cargo/env"
npm run tauri:build
```

## Build Desktop App (ad-hoc signed, for distribution)

Ad-hoc signing avoids the "app is damaged" error on macOS without an Apple
Developer certificate. Gatekeeper will still warn "unidentified developer" —
see the README Installation section for the user-side bypass.

```sh
. "$HOME/.cargo/env"
npm run tauri:build:signed
```

The release CI (`.github/workflows/release.yml`) ad-hoc signs macOS builds
automatically and attaches SHA256 checksums to each GitHub Release.
