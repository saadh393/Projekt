import { useDividerActions, useDividers } from "../../hooks/useDividers";
import { useProjectActions } from "../../hooks/useProjects";
import { allProjectsCategoryId } from "../../lib/constants";
import { filterProjectsByQuery } from "../../lib/fuzzySearch";
import { mergeListItems, nextDividerSortOrder, toReorderItems } from "../../lib/listItems";
import { projectsForCategory, sortProjects, visibleProjects } from "../../lib/projectSort";
import { moveItem } from "../../lib/reorder";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, ListItem, Project } from "../../lib/types";
import { EditDividerModal } from "../Forms/EditDividerModal";
import { DividerRow } from "./DividerRow";
import { ProjectCard } from "./ProjectCard";
import { ProjectListEmpty } from "./ProjectListEmpty";
import { ProjectListToolbar } from "./ProjectListToolbar";

type ProjectListProps = {
  projects: Project[];
  categories: Category[];
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
  const setEditingDividerId = useProjectUiStore((state) => state.setEditingDividerId);
  const isReordering = useProjectUiStore((state) => state.isReorderingProjects);
  const setReordering = useProjectUiStore((state) => state.setReorderingProjects);
  const { reorderProjects } = useProjectActions();
  const { data: dividers = [] } = useDividers(selectedCategoryId);
  const { createDivider, reorderListItems } = useDividerActions(selectedCategoryId);

  const scoped = projectsForCategory(projects, selectedCategoryId);
  const visible = visibleProjects(scoped, showHiddenProjects);
  const filtered = filterProjectsByQuery(visible, categories, searchQuery);
  const sorted = sortProjects(filtered, sortMode);
  const activeCategory = categories.find((category) => category.id === selectedCategoryId);
  const heading = activeCategory ? activeCategory.name : "All Projects";

  const dividersAreVisible = sortMode === "manual" && !searchQuery.trim();
  const items: ListItem[] = dividersAreVisible
    ? mergeListItems(sorted, dividers)
    : sorted.map((project) => ({ kind: "project", item: project }));

  const moveItemBy = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = moveItem(items, index, targetIndex);
    const containsDividers = reordered.some((entry) => entry.kind === "divider");

    if (containsDividers) {
      reorderListItems.mutate(toReorderItems(reordered));
      return;
    }

    reorderProjects.mutate(reordered.map((entry) => entry.item.id));
  };

  const handleAddDivider = () => {
    const categoryId =
      selectedCategoryId === allProjectsCategoryId ? null : selectedCategoryId;
    const sortOrder = nextDividerSortOrder(items);
    createDivider.mutate(
      { label: null, categoryId, sortOrder },
      {
        onSuccess: (divider) => setEditingDividerId(divider.id),
      },
    );
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
        canAddDivider={dividersAreVisible}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
        onShowHiddenChange={setShowHiddenProjects}
        onReorderToggle={setReordering}
        onAddDivider={handleAddDivider}
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
        {items.length ? (
          <div
            className="list-stagger flex flex-col"
            data-reordering={isReordering}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedProjectId(null);
              }
            }}
          >
            {items.map((entry, index) =>
              entry.kind === "project" ? (
                <ProjectCard
                  key={`project-${entry.item.id}`}
                  project={entry.item}
                  categories={categories}
                  selected={selectedProjectId === entry.item.id}
                  reordering={isReordering}
                  canMoveUp={index > 0}
                  canMoveDown={index < items.length - 1}
                  onSelect={() => setSelectedProjectId(entry.item.id)}
                  onMoveUp={() => moveItemBy(index, -1)}
                  onMoveDown={() => moveItemBy(index, 1)}
                />
              ) : (
                <DividerRow
                  key={`divider-${entry.item.id}`}
                  divider={entry.item}
                  categoryId={selectedCategoryId}
                  reordering={isReordering}
                  canMoveUp={index > 0}
                  canMoveDown={index < items.length - 1}
                  onMoveUp={() => moveItemBy(index, -1)}
                  onMoveDown={() => moveItemBy(index, 1)}
                />
              ),
            )}
          </div>
        ) : (
          <ProjectListEmpty onAddProject={() => setProjectSheetOpen(true)} />
        )}
      </div>

      <EditDividerModal dividers={dividers} />
    </main>
  );
}
