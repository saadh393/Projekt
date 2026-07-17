import { useEffect } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { terminalRuntime } from "../lib/terminalRuntime";
import { useTerminalStore } from "../store/useTerminalStore";

type TerminalOutput = {
  sessionId: string;
  data: number[];
};

type TerminalExit = {
  sessionId: string;
  exitCode: number;
};

export function useTerminalEvents() {
  useEffect(() => {
    let disposed = false;
    let unlistenOutput: UnlistenFn | undefined;
    let unlistenExit: UnlistenFn | undefined;

    void listen<TerminalOutput>("terminal-output", ({ payload }) => {
      terminalRuntime.write(payload.sessionId, payload.data);
    }).then((unlisten) => {
      if (disposed) {
        unlisten();
        return;
      }
      unlistenOutput = unlisten;
    });

    void listen<TerminalExit>("terminal-exit", ({ payload }) => {
      terminalRuntime.recordExit(payload.sessionId, payload.exitCode);
      useTerminalStore.getState().markExited(payload.sessionId, payload.exitCode);
    }).then((unlisten) => {
      if (disposed) {
        unlisten();
        return;
      }
      unlistenExit = unlisten;
    });

    return () => {
      disposed = true;
      unlistenOutput?.();
      unlistenExit?.();
    };
  }, []);
}
