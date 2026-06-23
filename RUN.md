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
