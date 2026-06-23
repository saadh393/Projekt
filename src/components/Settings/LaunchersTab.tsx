import { Trash2 } from "lucide-react";
import { useLauncherActions, useLaunchers } from "../../hooks/useLaunchers";
import { AddLauncherForm } from "../Forms/AddLauncherForm";

export function LaunchersTab() {
  const { data = [] } = useLaunchers();
  const { deleteLauncher } = useLauncherActions();

  return (
    <div className="space-y-4">
      <AddLauncherForm />
      <div className="space-y-2">
        {data.map((launcher) => (
          <div
            key={launcher.id}
            className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{launcher.label}</div>
              <div className="truncate font-mono text-xs text-zinc-500">{launcher.appPath}</div>
            </div>
            <button
              type="button"
              onClick={() => deleteLauncher.mutate(launcher.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label={`Delete ${launcher.label}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
