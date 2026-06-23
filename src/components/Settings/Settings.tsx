import { X } from "lucide-react";
import { cx } from "../../lib/cx";
import { useMountTransition } from "../../hooks/useMountTransition";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { CommandTemplatesTab } from "./CommandTemplatesTab";
import { GeneralTab } from "./GeneralTab";
import { LaunchersTab } from "./LaunchersTab";

const tabs = [
  { id: "general", label: "General" },
  { id: "launchers", label: "Launchers" },
  { id: "commands", label: "Commands" },
] as const;

export function Settings() {
  const isOpen = useProjectUiStore((state) => state.isSettingsOpen);
  const tab = useProjectUiStore((state) => state.settingsTab);
  const setOpen = useProjectUiStore((state) => state.setSettingsOpen);
  const setTab = useProjectUiStore((state) => state.setSettingsTab);
  const { render, state } = useMountTransition(isOpen, 220);

  if (!render) {
    return null;
  }

  return (
    <div className="modal-backdrop" data-state={state} onClick={() => setOpen(false)}>
      <section
        className="modal-panel w-[680px] max-w-[90vw]"
        data-state={state}
        onClick={(event) => event.stopPropagation()}
        style={{ height: 520 }}
      >
        <div
          className="relative flex items-center justify-center border-b"
          style={{ borderColor: "var(--border-divider)", height: 44 }}
        >
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-icon absolute right-2"
            aria-label="Close settings"
          >
            <X size={13} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr]">
          <nav
            className="border-r p-2"
            style={{
              borderColor: "var(--border-divider)",
              background: "rgba(0,0,0,0.015)",
            }}
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cx("row")}
                data-selected={tab === item.id}
              >
                <span className="min-w-0 flex-1 truncate text-[13px]">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="min-h-0 overflow-y-auto p-5">
            {tab === "general" ? <GeneralTab /> : null}
            {tab === "launchers" ? <LaunchersTab /> : null}
            {tab === "commands" ? <CommandTemplatesTab /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
