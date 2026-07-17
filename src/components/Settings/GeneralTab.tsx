import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import { shellLabels, terminalLabels } from "../../lib/constants";
import type { ShellPreference, TerminalPreference } from "../../lib/types";

export function GeneralTab() {
  const { data } = useSettings();
  const updateSettings = useUpdateSettings();
  const preferredTerminal = data?.preferredTerminal ?? "terminal";
  const preferredShell = data?.preferredShell ?? data?.availableShells[0] ?? "zsh";

  return (
    <div className="space-y-5">
      <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
        General
      </h3>

      <label className="block space-y-1.5">
        <span
          className="block text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Preferred terminal
        </span>
        <select
          value={preferredTerminal}
          onChange={(event) =>
            updateSettings.mutate({ preferredTerminal: event.target.value as TerminalPreference })
          }
          className="field appearance-none pr-7"
        >
          {Object.entries(terminalLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Used when running pinned commands and opening Terminal.
        </p>
      </label>

      <label className="block space-y-1.5">
        <span
          className="block text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Inner terminal shell
        </span>
        <select
          value={preferredShell}
          onChange={(event) =>
            updateSettings.mutate({ preferredShell: event.target.value as ShellPreference })
          }
          className="field appearance-none pr-7"
        >
          {(data?.availableShells ?? []).map((shell) => (
            <option key={shell} value={shell}>
              {shellLabels[shell]}
            </option>
          ))}
        </select>
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Used by commands configured for the inner terminal.
        </p>
      </label>
    </div>
  );
}
