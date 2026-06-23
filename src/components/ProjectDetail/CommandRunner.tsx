import { Play } from "lucide-react";
import { useProjectActions } from "../../hooks/useProjects";
import type { CommandTemplate, Project } from "../../lib/types";

type CommandRunnerProps = {
  project: Project;
  templates: CommandTemplate[];
};

export function CommandRunner({ project, templates }: CommandRunnerProps) {
  const { runCommandTemplate } = useProjectActions();
  const pinned = templates.filter((template) => project.pinnedCommands.includes(template.id));

  if (!pinned.length) {
    return (
      <div
        className="rounded-[10px] border border-dashed px-3 py-3 text-center text-[12px]"
        style={{
          borderColor: "var(--border-strong)",
          color: "var(--text-tertiary)",
          background: "rgba(255,255,255,0.4)",
        }}
      >
        No pinned commands
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {pinned.map((template) => (
        <div
          key={template.id}
          className="flex items-center gap-2 rounded-[10px] border px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.65)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[12px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {template.label}
            </div>
            <div
              className="truncate font-mono text-[11px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {template.command}
            </div>
          </div>
          <button
            type="button"
            onClick={() => runCommandTemplate.mutate({ projectId: project.id, templateId: template.id })}
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 1px 2px rgba(10,132,255,0.25)",
            }}
            aria-label={`Run ${template.label}`}
          >
            <Play size={11} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
  );
}
