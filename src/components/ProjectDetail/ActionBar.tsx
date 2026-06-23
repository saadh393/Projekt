import { MonitorUp } from "lucide-react";
import { useProjectActions } from "../../hooks/useProjects";
import type { AppLauncher, Project } from "../../lib/types";

type ActionBarProps = {
  project: Project;
  launchers: AppLauncher[];
  compact?: boolean;
};

const hardcodedActions = [
  { id: "finder", label: "Finder", icon: "/finder.svg" },
  { id: "vscode", label: "VS Code", icon: "/vscode.svg" },
  { id: "terminal", label: "Terminal", icon: "/terminal.svg" },
] as const;

export function ActionBar({ project, launchers }: ActionBarProps) {
  const { openFinder, openVsCode, openTerminal, openWithLauncher } = useProjectActions();

  const handlers: Record<(typeof hardcodedActions)[number]["id"], () => void> = {
    finder: () => openFinder.mutate(project.id),
    vscode: () => openVsCode.mutate(project.id),
    terminal: () => openTerminal.mutate(project.id),
  };

  return (
    <div className="flex flex-wrap gap-2">
      {hardcodedActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={handlers[action.id]}
          className="group flex flex-col items-center justify-center gap-1.5 rounded-[12px] border bg-white px-3 py-2.5 text-[11px] font-medium"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-secondary)",
            width: 72,
            transition:
              "background-color 160ms var(--ease-out), border-color 160ms var(--ease-out), transform 140ms var(--ease-out)",
          }}
          title={`Open in ${action.label}`}
        >
          <img
            src={action.icon}
            alt=""
            aria-hidden
            className="h-7 w-7"
            style={{ pointerEvents: "none" }}
          />
          <span>{action.label}</span>
        </button>
      ))}
      {launchers.map((launcher) => (
        <button
          key={launcher.id}
          type="button"
          onClick={() => openWithLauncher.mutate({ projectId: project.id, launcherId: launcher.id })}
          className="flex flex-col items-center justify-center gap-1.5 rounded-[12px] border bg-white px-3 py-2.5 text-[11px] font-medium"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-secondary)",
            width: 72,
          }}
          title={launcher.appPath}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-[8px]"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <MonitorUp size={16} />
          </span>
          <span className="line-clamp-1 max-w-[60px] text-center">{launcher.label}</span>
        </button>
      ))}
    </div>
  );
}
