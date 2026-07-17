import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AddProjectSheet } from "./Forms/AddProjectSheet";
import { EditCategoryModal } from "./Forms/EditCategoryModal";
import { ProjectDetail } from "./ProjectDetail/ProjectDetail";
import { ProjectDetailSheet } from "./ProjectDetail/ProjectDetailSheet";
import { ProjectList } from "./ProjectList/ProjectList";
import { Settings } from "./Settings/Settings";
import { Sidebar } from "./Sidebar/Sidebar";
import { Titlebar } from "./Titlebar";
import { useCategories } from "../hooks/useCategories";
import { useDisableContextMenu } from "../hooks/useDisableContextMenu";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLaunchers } from "../hooks/useLaunchers";
import { usePreferencesHydration } from "../hooks/usePreferencesHydration";
import { useProjects } from "../hooks/useProjects";
import { useTerminalEvents } from "../hooks/useTerminalEvents";
import { useProjectUiStore } from "../store/useProjectUiStore";
import { useTerminalStore } from "../store/useTerminalStore";

const NARROW_BREAKPOINT = 1024;
const TerminalPanel = lazy(() =>
  import("./Terminal/TerminalPanel").then((module) => ({ default: module.TerminalPanel })),
);

export function AppShell() {
  useKeyboardShortcuts();
  useDisableContextMenu();
  useTerminalEvents();
  usePreferencesHydration();

  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useCategories();
  const { data: launchers = [] } = useLaunchers();
  const selectedProjectId = useProjectUiStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const hasTerminalSessions = useTerminalStore((state) => state.sessions.length > 0);
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
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Titlebar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar categories={categories} projects={projects} />
        <ProjectList projects={projects} categories={categories} />
        {isNarrow ? null : (
          <ProjectDetail
            project={selectedProject}
            categories={categories}
            launchers={launchers}
          />
        )}
      </div>
      <Suspense fallback={null}>{hasTerminalSessions ? <TerminalPanel /> : null}</Suspense>
      <ProjectDetailSheet
        open={isNarrow && Boolean(selectedProject)}
        project={selectedProject}
        categories={categories}
        launchers={launchers}
        onClose={() => setSelectedProjectId(null)}
      />
      <AddProjectSheet
        categories={categories}
        projects={projects}
      />
      <EditCategoryModal categories={categories} />
      <Settings />
    </div>
  );
}
