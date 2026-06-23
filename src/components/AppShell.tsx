import { useMemo } from "react";
import { AddProjectSheet } from "./Forms/AddProjectSheet";
import { ProjectDetail } from "./ProjectDetail/ProjectDetail";
import { ProjectList } from "./ProjectList/ProjectList";
import { Settings } from "./Settings/Settings";
import { Sidebar } from "./Sidebar/Sidebar";
import { useCategories } from "../hooks/useCategories";
import { useCommandTemplates } from "../hooks/useCommandTemplates";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLaunchers } from "../hooks/useLaunchers";
import { useProjects } from "../hooks/useProjects";
import { useProjectUiStore } from "../store/useProjectUiStore";

export function AppShell() {
  useKeyboardShortcuts();

  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useCategories();
  const { data: launchers = [] } = useLaunchers();
  const { data: commandTemplates = [] } = useCommandTemplates();
  const selectedProjectId = useProjectUiStore((state) => state.selectedProjectId);
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f2ee] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar categories={categories} projects={projects} />
      <ProjectList projects={projects} categories={categories} launchers={launchers} />
      <ProjectDetail
        project={selectedProject}
        categories={categories}
        launchers={launchers}
        commandTemplates={commandTemplates}
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
