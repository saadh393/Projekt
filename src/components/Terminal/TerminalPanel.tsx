import { useRef } from "react";
import { ChevronDown, Maximize2, Minimize2, OctagonX, X } from "lucide-react";
import { api } from "../../lib/api";
import { clampTerminalPanelHeight } from "../../lib/terminalPanel";
import { terminalRuntime } from "../../lib/terminalRuntime";
import { useTerminalStore } from "../../store/useTerminalStore";
import { TerminalView } from "./TerminalView";

export function TerminalPanel() {
  const sessions = useTerminalStore((state) => state.sessions);
  const activeSessionId = useTerminalStore((state) => state.activeSessionId);
  const panelMode = useTerminalStore((state) => state.panelMode);
  const panelHeight = useTerminalStore((state) => state.panelHeight);
  const setActiveSession = useTerminalStore((state) => state.setActiveSession);
  const removeSession = useTerminalStore((state) => state.removeSession);
  const markExited = useTerminalStore((state) => state.markExited);
  const setPanelMode = useTerminalStore((state) => state.setPanelMode);
  const setPanelHeight = useTerminalStore((state) => state.setPanelHeight);
  const dragRef = useRef<{ y: number; height: number } | null>(null);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;

  if (!sessions.length) {
    return null;
  }

  const closeSession = (sessionId: string) => {
    void api
      .killTerminalSession(sessionId)
      .catch(() => undefined)
      .finally(() => {
        terminalRuntime.dispose(sessionId);
        removeSession(sessionId);
      });
  };

  const killActiveSession = () => {
    if (!activeSession || activeSession.status === "exited") {
      return;
    }

    void api.killTerminalSession(activeSession.id).then(() => {
      markExited(activeSession.id, 137);
    });
  };

  const beginResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panelMode !== "normal") {
      return;
    }

    dragRef.current = { y: event.clientY, height: panelHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }

    const height = dragRef.current.height + dragRef.current.y - event.clientY;
    setPanelHeight(clampTerminalPanelHeight(height, window.innerHeight));
  };

  const height =
    panelMode === "collapsed"
      ? 36
      : panelMode === "expanded"
        ? "calc(100vh - 28px)"
        : panelHeight;

  return (
    <section
      className="relative shrink-0 overflow-hidden border-t"
      style={{ height, borderColor: "#27272a", background: "#111214" }}
    >
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 cursor-row-resize"
        onPointerDown={beginResize}
        onPointerMove={resize}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      />
      <div
        className="flex h-9 items-center border-b pl-2"
        style={{ borderColor: "#27272a", background: "#18181b", color: "#d4d4d8" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex h-7 max-w-[190px] shrink-0 items-center rounded-md text-[11px]"
              style={{
                background: session.id === activeSessionId ? "#27272a" : "transparent",
                color: session.id === activeSessionId ? "#f4f4f5" : "#a1a1aa",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveSession(session.id)}
                className="flex min-w-0 flex-1 items-center gap-2 pl-2"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: session.status === "running" ? "#22c55e" : "#71717a" }}
                />
                <span className="truncate">{session.label}</span>
              </button>
              <button
                type="button"
                onClick={() => closeSession(session.id)}
                className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-white/10"
                aria-label={`Close ${session.label}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 px-2">
          <button
            type="button"
            onClick={killActiveSession}
            disabled={!activeSession || activeSession.status === "exited"}
            className="flex h-6 items-center gap-1 rounded px-2 text-[11px] disabled:opacity-35"
            style={{ color: "#f87171" }}
            aria-label="Kill active terminal process"
          >
            <OctagonX size={12} />
            Kill
          </button>
          <button
            type="button"
            onClick={() => setPanelMode(panelMode === "expanded" ? "normal" : "expanded")}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
            aria-label={panelMode === "expanded" ? "Restore terminal" : "Expand terminal"}
          >
            {panelMode === "expanded" ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            type="button"
            onClick={() => setPanelMode(panelMode === "collapsed" ? "normal" : "collapsed")}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
            aria-label={panelMode === "collapsed" ? "Open terminal" : "Collapse terminal"}
          >
            <ChevronDown
              size={13}
              style={{ transform: panelMode === "collapsed" ? "rotate(180deg)" : undefined }}
            />
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-36px)]" style={{ display: panelMode === "collapsed" ? "none" : "block" }}>
        {sessions.map((session) => (
          <TerminalView
            key={session.id}
            sessionId={session.id}
            active={session.id === activeSessionId}
            running={session.status === "running"}
          />
        ))}
      </div>
    </section>
  );
}
