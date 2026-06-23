import { useEffect, useMemo, useState } from "react";
import { AddProjectSheet } from "./Forms/AddProjectSheet";
import { ProjectDetail } from "./ProjectDetail/ProjectDetail";
import { ProjectDetailSheet } from "./ProjectDetail/ProjectDetailSheet";
import { ProjectList } from "./ProjectList/ProjectList";
import { Settings } from "./Settings/Settings";
import { Sidebar } from "./Sidebar/Sidebar";
import { useCategories } from "../hooks/useCategories";
import { useCommandTemplates } from "../hooks/useCommandTemplates";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLaunchers } from "../hooks/useLaunchers";
import { useProjects } from "../hooks/useProjects";
import { useProjectUiStore } from "../store/useProjectUiStore";

const NARROW_BREAKPOINT = 1024;

export function AppShell() {
  useKeyboardShortcuts();

  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useCategories();
  const { data: launchers = [] } = useLaunchers();
  const { data: commandTemplates = [] } = useCommandTemplates();
  const selectedProjectId = useProjectUiStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < NARROW_BREAKPOINT,
  );

  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < NARROW_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div
      className="relative flex h-screen overflow-hidden"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <div className="titlebar" data-tauri-drag-region />

      <Sidebar categories={categories} projects={projects} />
      <ProjectList projects={projects} categories={categories} launchers={launchers} />
      {isNarrow ? null : (
        <ProjectDetail
          project={selectedProject}
          categories={categories}
          launchers={launchers}
          commandTemplates={commandTemplates}
        />
      )}
      <ProjectDetailSheet
        open={isNarrow && Boolean(selectedProject)}
        project={selectedProject}
        categories={categories}
        launchers={launchers}
        commandTemplates={commandTemplates}
        onClose={() => setSelectedProjectId(null)}
      />
      <AddProjectSheet
        categories={categories}
        commandTemplates={commandTemplates}
        projects={projects}
      />
      <Settings />
    </div>
  );
}
