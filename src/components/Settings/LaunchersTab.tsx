import { MonitorUp, Trash2 } from "lucide-react";
import { useLauncherActions, useLaunchers } from "../../hooks/useLaunchers";
import { AddLauncherForm } from "../Forms/AddLauncherForm";

export function LaunchersTab() {
  const { data = [] } = useLaunchers();
  const { deleteLauncher } = useLauncherActions();

  return (
    <div className="space-y-5">
      <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
        Launchers
      </h3>

      <AddLauncherForm />

      {data.length ? (
        <div className="space-y-1">
          {data.map((launcher) => (
            <div
              key={launcher.id}
              className="group flex items-center gap-2.5 rounded-[8px] border bg-white px-3 py-2"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <MonitorUp size={14} style={{ color: "var(--text-tertiary)" }} />
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[13px] font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {launcher.label}
                </div>
                <div
                  className="truncate font-mono text-[11px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {launcher.appPath}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteLauncher.mutate(launcher.id)}
                className="btn-icon btn-destructive"
                aria-label={`Delete ${launcher.label}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
