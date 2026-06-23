import { useState } from "react";
import { useProjectActions } from "../../hooks/useProjects";
import { filterProjectsByQuery } from "../../lib/fuzzySearch";
import { projectsForCategory, sortProjects, visibleProjects } from "../../lib/projectSort";
import { moveItem } from "../../lib/reorder";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { AppLauncher, Category, Project } from "../../lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectListToolbar } from "./ProjectListToolbar";

type ProjectListProps = {
  projects: Project[];
  categories: Category[];
  launchers: AppLauncher[];
};

export function ProjectList({ projects, categories, launchers }: ProjectListProps) {
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const selectedProjectId = useProjectUiStore((state) => state.selectedProjectId);
  const searchQuery = useProjectUiStore((state) => state.searchQuery);
  const sortMode = useProjectUiStore((state) => state.sortMode);
  const showHiddenProjects = useProjectUiStore((state) => state.showHiddenProjects);
  const setSearchQuery = useProjectUiStore((state) => state.setSearchQuery);
  const setSortMode = useProjectUiStore((state) => state.setSortMode);
  const setShowHiddenProjects = useProjectUiStore((state) => state.setShowHiddenProjects);
  const setProjectSheetOpen = useProjectUiStore((state) => state.setProjectSheetOpen);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const { reorderProjects } = useProjectActions();
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  const scoped = projectsForCategory(projects, selectedCategoryId);
  const visible = visibleProjects(scoped, showHiddenProjects);
  const filtered = filterProjectsByQuery(visible, categories, searchQuery);
  const sorted = sortProjects(filtered, sortMode);

  const reorderVisibleProjects = (targetProjectId: string) => {
    if (!draggingProjectId || draggingProjectId === targetProjectId) {
      return;
    }

    const fromIndex = sorted.findIndex((project) => project.id === draggingProjectId);
    const toIndex = sorted.findIndex((project) => project.id === targetProjectId);
    const reordered = moveItem(sorted, fromIndex, toIndex);

    reorderProjects.mutate(reordered.map((project) => project.id));
    setDraggingProjectId(null);
  };

  return (
    <main className="h-screen min-w-0 flex-1 overflow-y-auto bg-transparent text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <ProjectListToolbar
        searchQuery={searchQuery}
        sortMode={sortMode}
        showHiddenProjects={showHiddenProjects}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
        onShowHiddenChange={setShowHiddenProjects}
        onAddProject={() => setProjectSheetOpen(true)}
      />

      <div className="px-5 py-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-zinc-500">{sorted.length} visible projects</p>
          </div>
        </div>

        {sorted.length ? (
          <div className="grid gap-3">
            {sorted.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                categories={categories}
                launchers={launchers}
                selected={selectedProjectId === project.id}
                manualMode={sortMode === "manual"}
                onSelect={() => setSelectedProjectId(project.id)}
                onDragStart={() => setDraggingProjectId(project.id)}
                onDragOver={() => undefined}
                onDrop={() => reorderVisibleProjects(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white bg-white/45 text-sm text-zinc-500 shadow-sm dark:border-zinc-800">
            No projects match this view.
          </div>
        )}
      </div>
    </main>
  );
}
