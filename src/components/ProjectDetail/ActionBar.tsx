import { Code2, FolderOpen, MonitorUp, Terminal, type LucideIcon } from "lucide-react";
import { useProjectActions } from "../../hooks/useProjects";
import type { AppLauncher, Project } from "../../lib/types";

type ActionBarProps = {
  project: Project;
  launchers: AppLauncher[];
  compact?: boolean;
};

const actionButtonClass =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-white bg-white/90 px-2.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900";

const launcherButtonClass =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-2.5 text-xs text-zinc-700 hover:bg-white dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900";

export function ActionBar({ project, launchers, compact = false }: ActionBarProps) {
  const { openFinder, openVsCode, openTerminal, openWithLauncher } = useProjectActions();

  const hardcodedActions: Array<{
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  }> = [
    {
      label: "Finder",
      icon: FolderOpen,
      onClick: () => openFinder.mutate(project.id),
    },
    {
      label: "VS Code",
      icon: Code2,
      onClick: () => openVsCode.mutate(project.id),
    },
    {
      label: "Terminal",
      icon: Terminal,
      onClick: () => openTerminal.mutate(project.id),
    },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "py-2"}`}>
      {hardcodedActions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={actionButtonClass}
            title={action.label}
          >
            <Icon size={14} />
            {action.label}
          </button>
        );
      })}
      {launchers.map((launcher) => (
        <button
          key={launcher.id}
          type="button"
          onClick={() => openWithLauncher.mutate({ projectId: project.id, launcherId: launcher.id })}
          className={launcherButtonClass}
          title={launcher.appPath}
        >
          <MonitorUp size={14} />
          {launcher.label}
        </button>
      ))}
    </div>
  );
}
