import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { restoreSession, startSessionSync } from "./lib/sessionPersistence";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

void restoreSession().finally(() => {
  startSessionSync();
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
