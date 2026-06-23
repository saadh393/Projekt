import { X } from "lucide-react";
import { cx } from "../../lib/cx";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { CommandTemplatesTab } from "./CommandTemplatesTab";
import { GeneralTab } from "./GeneralTab";
import { LaunchersTab } from "./LaunchersTab";

export function Settings() {
  const isOpen = useProjectUiStore((state) => state.isSettingsOpen);
  const tab = useProjectUiStore((state) => state.settingsTab);
  const setOpen = useProjectUiStore((state) => state.setSettingsOpen);
  const setTab = useProjectUiStore((state) => state.setSettingsTab);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="flex h-[640px] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr]">
          <nav className="border-r border-zinc-200 p-3 dark:border-zinc-800">
            {(["general", "launchers", "commands"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cx(
                  "mb-1 w-full rounded-md px-3 py-2 text-left text-sm capitalize",
                  tab === item
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                )}
              >
                {item === "commands" ? "Command Templates" : item}
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
