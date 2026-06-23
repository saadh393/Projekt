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
      <div className="rounded-md border border-dashed border-zinc-200 px-3 py-3 text-sm text-zinc-500 dark:border-zinc-800">
        No pinned command templates.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pinned.map((template) => (
        <div
          key={template.id}
          className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{template.label}</div>
            <div className="truncate font-mono text-xs text-zinc-500">{template.command}</div>
          </div>
          <button
            type="button"
            onClick={() => runCommandTemplate.mutate({ projectId: project.id, templateId: template.id })}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white"
            aria-label={`Run ${template.label}`}
          >
            <Play size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
