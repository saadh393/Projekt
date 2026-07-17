import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { api } from "../../lib/api";
import { terminalRuntime } from "../../lib/terminalRuntime";

type TerminalViewProps = {
  sessionId: string;
  active: boolean;
  running: boolean;
};

export function TerminalView({ sessionId, active, running }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      disableStdin: !running,
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: 12,
      lineHeight: 1.25,
      scrollback: 5000,
      theme: {
        background: "#111214",
        foreground: "#e5e7eb",
        cursor: "#f8fafc",
        selectionBackground: "#334155",
      },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);
    terminalRuntime.attach(sessionId, terminal);
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const dataDisposable = terminal.onData((data) => {
      const bytes = Array.from(new TextEncoder().encode(data));
      void api.writeTerminalSession(sessionId, bytes).catch(() => undefined);
    });
    const resizeDisposable = terminal.onResize(({ rows, cols }) => {
      void api.resizeTerminalSession(sessionId, rows, cols).catch(() => undefined);
    });
    const observer = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        fitAddon.fit();
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      fitAddonRef.current = null;
      terminalRef.current = null;
      terminalRuntime.detach(sessionId);
      terminal.dispose();
    };
  }, [sessionId]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.options.disableStdin = !running;
    }
  }, [running]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      fitAddonRef.current?.fit();
      terminalRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full px-2 py-1"
      style={{ display: active ? "block" : "none", background: "#111214" }}
    />
  );
}
