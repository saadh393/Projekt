import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import { terminalLabels } from "../../lib/constants";
import type { TerminalPreference } from "../../lib/types";

export function GeneralTab() {
  const { data } = useSettings();
  const updateSettings = useUpdateSettings();
  const preferredTerminal = data?.preferredTerminal ?? "terminal";

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Preferred terminal</span>
        <select
          value={preferredTerminal}
          onChange={(event) =>
            updateSettings.mutate({ preferredTerminal: event.target.value as TerminalPreference })
          }
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {Object.entries(terminalLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
