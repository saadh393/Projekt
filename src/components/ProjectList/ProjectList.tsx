import { useProjectActions } from "../../hooks/useProjects";
import { filterProjectsByQuery } from "../../lib/fuzzySearch";
import { projectsForCategory, sortProjects, visibleProjects } from "../../lib/projectSort";
import { moveItem } from "../../lib/reorder";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { AppLauncher, Category, Project } from "../../lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectListEmpty } from "./ProjectListEmpty";
import { ProjectListToolbar } from "./ProjectListToolbar";

type ProjectListProps = {
  projects: Project[];
  categories: Category[];
  launchers: AppLauncher[];
};

export function ProjectList({ projects, categories }: ProjectListProps) {
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
  const isReordering = useProjectUiStore((state) => state.isReorderingProjects);
  const setReordering = useProjectUiStore((state) => state.setReorderingProjects);
  const { reorderProjects } = useProjectActions();
  const scoped = projectsForCategory(projects, selectedCategoryId);
  const visible = visibleProjects(scoped, showHiddenProjects);
  const filtered = filterProjectsByQuery(visible, categories, searchQuery);
  const sorted = sortProjects(filtered, sortMode);
  const activeCategory = categories.find((category) => category.id === selectedCategoryId);
  const heading = activeCategory ? activeCategory.name : "All Projects";

  const moveProjectBy = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const reordered = moveItem(sorted, index, targetIndex);
    reorderProjects.mutate(reordered.map((project) => project.id));
  };

  return (
    <main
      className="scroll-shell flex h-screen min-w-0 flex-1 flex-col overflow-hidden pt-7"
      style={{ background: "var(--bg-content)" }}
    >
      <div className="flex items-end justify-between px-6 pt-2 pb-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {heading}
          </h1>
          <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {sorted.length} {sorted.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      <ProjectListToolbar
        searchQuery={searchQuery}
        sortMode={sortMode}
        showHiddenProjects={showHiddenProjects}
        isReordering={isReordering}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
        onShowHiddenChange={setShowHiddenProjects}
        onReorderToggle={setReordering}
        onAddProject={() => setProjectSheetOpen(true)}
      />

      <div
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelectedProjectId(null);
          }
        }}
      >
        {sorted.length ? (
          <div
            className="list-stagger flex flex-col"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedProjectId(null);
              }
            }}
          >
            {sorted.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                categories={categories}
                selected={selectedProjectId === project.id}
                reordering={isReordering}
                canMoveUp={index > 0}
                canMoveDown={index < sorted.length - 1}
                onSelect={() => setSelectedProjectId(project.id)}
                onMoveUp={() => moveProjectBy(index, -1)}
                onMoveDown={() => moveProjectBy(index, 1)}
              />
            ))}
          </div>
        ) : (
          <ProjectListEmpty onAddProject={() => setProjectSheetOpen(true)} />
        )}
      </div>
    </main>
  );
}
