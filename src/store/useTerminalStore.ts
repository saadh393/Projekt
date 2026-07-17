import { create } from "zustand";
import { terminalRuntime } from "../lib/terminalRuntime";
import type { TerminalSession } from "../lib/types";

export type TerminalSessionState = TerminalSession & {
  status: "running" | "exited";
  exitCode: number | null;
};

type TerminalPanelMode = "normal" | "collapsed" | "expanded";

type TerminalState = {
  sessions: TerminalSessionState[];
  activeSessionId: string | null;
  panelMode: TerminalPanelMode;
  panelHeight: number;
  addSession: (session: TerminalSession) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  markExited: (sessionId: string, exitCode: number) => void;
  setPanelMode: (mode: TerminalPanelMode) => void;
  setPanelHeight: (height: number) => void;
};

export const useTerminalStore = create<TerminalState>((set) => ({
  sessions: [],
  activeSessionId: null,
  panelMode: "normal",
  panelHeight: 300,
  addSession: (session) =>
    set((state) => {
      const exitCode = terminalRuntime.getExitCode(session.id);
      return {
        sessions: [
          ...state.sessions,
          {
            ...session,
            status: exitCode === undefined ? "running" : "exited",
            exitCode: exitCode ?? null,
          },
        ],
        activeSessionId: session.id,
        panelMode: state.panelMode === "collapsed" ? "normal" : state.panelMode,
      };
    }),
  removeSession: (sessionId) =>
    set((state) => {
      const index = state.sessions.findIndex((session) => session.id === sessionId);
      const sessions = state.sessions.filter((session) => session.id !== sessionId);
      const activeSessionId =
        state.activeSessionId === sessionId
          ? (sessions[Math.min(index, sessions.length - 1)]?.id ?? null)
          : state.activeSessionId;

      return {
        sessions,
        activeSessionId,
        panelMode: sessions.length ? state.panelMode : "normal",
      };
    }),
  setActiveSession: (activeSessionId) => set({ activeSessionId }),
  markExited: (sessionId, exitCode) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, status: "exited", exitCode }
          : session,
      ),
    })),
  setPanelMode: (panelMode) => set({ panelMode }),
  setPanelHeight: (panelHeight) => set({ panelHeight }),
}));
