import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMountTransition } from "../../hooks/useMountTransition";
import type { AppLauncher, Category, CommandTemplate, Project } from "../../lib/types";
import { ProjectDetail } from "./ProjectDetail";

type ProjectDetailSheetProps = {
  open: boolean;
  project: Project | null;
  categories: Category[];
  launchers: AppLauncher[];
  commandTemplates: CommandTemplate[];
  onClose: () => void;
};

export function ProjectDetailSheet({
  open,
  project,
  categories,
  launchers,
  commandTemplates,
  onClose,
}: ProjectDetailSheetProps) {
  const { render, state } = useMountTransition(open, 360);
  const [latest, setLatest] = useState<Project | null>(project);

  useEffect(() => {
    if (project) setLatest(project);
  }, [project]);

  if (!render || !latest) {
    return null;
  }

  return (
    <>
      <div className="sheet-backdrop" data-state={state} onClick={onClose} />
      <aside className="sheet-panel z-50" data-state={state} style={{ maxWidth: 400 }}>
        <div
          className="flex items-center justify-end border-b px-3"
          style={{ borderColor: "var(--border-divider)", height: 44 }}
        >
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProjectDetail
            project={latest}
            categories={categories}
            launchers={launchers}
            commandTemplates={commandTemplates}
            embedded
          />
        </div>
      </aside>
    </>
  );
}
