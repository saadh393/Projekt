import { Code2, FolderOpen, MonitorUp, Terminal, type LucideIcon } from "lucide-react";
import { useProjectActions } from "../../hooks/useProjects";
import type { AppLauncher, Project } from "../../lib/types";

type ActionBarProps = {
  project: Project;
  launchers: AppLauncher[];
  compact?: boolean;
};

const primaryButtonClass =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium";

export function ActionBar({ project, launchers }: ActionBarProps) {
  const { openFinder, openVsCode, openTerminal, openWithLauncher } = useProjectActions();

  const hardcodedActions: Array<{
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  }> = [
    { label: "Finder", icon: FolderOpen, onClick: () => openFinder.mutate(project.id) },
    { label: "VS Code", icon: Code2, onClick: () => openVsCode.mutate(project.id) },
    { label: "Terminal", icon: Terminal, onClick: () => openTerminal.mutate(project.id) },
  ];

  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-[10px] border p-1.5"
      style={{
        background: "rgba(255,255,255,0.65)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {hardcodedActions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={primaryButtonClass}
            title={`Open in ${action.label}`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 1px 2px rgba(10,132,255,0.25)",
            }}
          >
            <Icon size={12} />
            {action.label}
          </button>
        );
      })}
      {launchers.map((launcher) => (
        <button
          key={launcher.id}
          type="button"
          onClick={() => openWithLauncher.mutate({ projectId: project.id, launcherId: launcher.id })}
          className={primaryButtonClass}
          title={launcher.appPath}
          style={{
            background: "#fff",
            color: "var(--text-primary)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <MonitorUp size={12} />
          {launcher.label}
        </button>
      ))}
    </div>
  );
}
