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
  { id: "vscode", label: "Code", icon: "/vscode.svg" },
  { id: "antigravity", label: "Antigravity", icon: "/antigravity.svg" },
  { id: "terminal", label: "Terminal", icon: "/terminal.svg" },
] as const;

export function ActionBar({ project, launchers }: ActionBarProps) {
  const { openFinder, openVsCode, openAntigravity, openTerminal, openWithLauncher } = useProjectActions();

  const handlers: Record<(typeof hardcodedActions)[number]["id"], () => void> = {
    finder: () => openFinder.mutate(project.id),
    vscode: () => openVsCode.mutate(project.id),
    antigravity: () => openAntigravity.mutate(project.id),
    terminal: () => openTerminal.mutate(project.id),
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {hardcodedActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={handlers[action.id]}
          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border bg-white px-2.5 text-[12px] font-medium"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          title={`Open in ${action.label}`}
        >
          <img src={action.icon} alt="" aria-hidden className="h-4 w-4" />
          <span>{action.label}</span>
        </button>
      ))}
      {launchers.map((launcher) => (
        <button
          key={launcher.id}
          type="button"
          onClick={() => openWithLauncher.mutate({ projectId: project.id, launcherId: launcher.id })}
          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border bg-white px-2.5 text-[12px] font-medium"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          title={launcher.appPath}
        >
          <span
            className="flex h-4 w-4 items-center justify-center rounded-[4px]"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <MonitorUp size={11} />
          </span>
          <span className="truncate max-w-[120px]">{launcher.label}</span>
        </button>
      ))}
    </div>
  );
}
