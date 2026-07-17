import type { Terminal } from "@xterm/xterm";

type RuntimeSession = {
  terminal: Terminal | null;
  pending: Uint8Array[];
};

const sessions = new Map<string, RuntimeSession>();
const exitCodes = new Map<string, number>();
const closedSessions = new Set<string>();

const getSession = (sessionId: string) => {
  const current = sessions.get(sessionId);

  if (current) {
    return current;
  }

  const created: RuntimeSession = { terminal: null, pending: [] };
  sessions.set(sessionId, created);
  return created;
};

export const terminalRuntime = {
  attach(sessionId: string, terminal: Terminal) {
    closedSessions.delete(sessionId);
    const session = getSession(sessionId);
    session.terminal = terminal;

    for (const data of session.pending) {
      terminal.write(data);
    }

    session.pending = [];
  },
  detach(sessionId: string) {
    const session = sessions.get(sessionId);
    if (session) {
      session.terminal = null;
    }
  },
  write(sessionId: string, data: number[]) {
    if (closedSessions.has(sessionId)) {
      return;
    }

    const session = getSession(sessionId);
    const bytes = new Uint8Array(data);

    if (session.terminal) {
      session.terminal.write(bytes);
      return;
    }

    session.pending.push(bytes);
  },
  recordExit(sessionId: string, exitCode: number) {
    if (closedSessions.has(sessionId)) {
      return;
    }

    exitCodes.set(sessionId, exitCode);
  },
  getExitCode(sessionId: string) {
    return exitCodes.get(sessionId);
  },
  dispose(sessionId: string) {
    closedSessions.add(sessionId);
    sessions.delete(sessionId);
    exitCodes.delete(sessionId);
    window.setTimeout(() => closedSessions.delete(sessionId), 5000);
  },
};
