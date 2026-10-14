import { useState } from "react";
import { useDividerActions, useDividers } from "../../hooks/useDividers";
import { allProjectsCategoryId } from "../../lib/constants";
import { filterProjectsByQuery } from "../../lib/fuzzySearch";
import { mergeListItems, nextDividerSortOrder, sortOrdersAfterMove } from "../../lib/listItems";
import { projectsForCategory, sortProjects, visibleProjects } from "../../lib/projectSort";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, ListItem, Project } from "../../lib/types";
import { EditDividerModal } from "../Forms/EditDividerModal";
import { SortableList } from "../Sortable/SortableList";
import { SortableRow } from "../Sortable/SortableRow";
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
  const { data: dividers = [] } = useDividers(selectedCategoryId);
  const { createDivider, reorderListItems } = useDividerActions(selectedCategoryId);

  const scoped = projectsForCategory(projects, selectedCategoryId);
  const visible = visibleProjects(scoped, showHiddenProjects);
  const filtered = filterProjectsByQuery(visible, categories, searchQuery);
  const sorted = sortProjects(filtered, sortMode);
  const activeCategory = categories.find((category) => category.id === selectedCategoryId);
  const heading = activeCategory ? activeCategory.name : "All Projects";

  const [isReordering, setReordering] = useState(false);
  const isManualOrder = sortMode === "manual" && !searchQuery.trim();
  const items: ListItem[] = isManualOrder
    ? mergeListItems(sorted, dividers)
    : sorted.map((project) => ({ kind: "project", item: project }));
  const itemKeys = items.map((entry) => `${entry.kind}-${entry.item.id}`);

  const handleReorder = (activeKey: string, overKey: string) => {
    const orders = sortOrdersAfterMove(items, itemKeys.indexOf(activeKey), itemKeys.indexOf(overKey));
    if (orders.length) {
      reorderListItems.mutate(orders);
    }
  };

  const handleReorderToggle = () => {
    if (!isReordering) {
      setSortMode("manual");
      setSearchQuery("");
    }
    setReordering(!isReordering);
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
      className="scroll-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-7"
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
        canReorder={items.length > 1}
        canAddDivider={isManualOrder}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
        onShowHiddenChange={setShowHiddenProjects}
        onReorderToggle={handleReorderToggle}
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
          <SortableList ids={itemKeys} onReorder={handleReorder}>
            <div
              className="list-stagger flex flex-col"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSelectedProjectId(null);
                }
              }}
            >
              {items.map((entry, index) => (
                <SortableRow key={itemKeys[index]} id={itemKeys[index]} disabled={!isReordering}>
                  {entry.kind === "project" ? (
                    <ProjectCard
                      project={entry.item}
                      categories={categories}
                      selected={selectedProjectId === entry.item.id}
                      onSelect={() => setSelectedProjectId(entry.item.id)}
                    />
                  ) : (
                    <DividerRow divider={entry.item} categoryId={selectedCategoryId} />
                  )}
                </SortableRow>
              ))}
            </div>
          </SortableList>
        ) : (
          <ProjectListEmpty onAddProject={() => setProjectSheetOpen(true)} />
        )}
      </div>

      <EditDividerModal dividers={dividers} />
    </main>
  );
}
