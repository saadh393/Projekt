import { useEffect } from "react";
import { allProjectsCategoryId } from "../lib/constants";
import { useProjectUiStore } from "../store/useProjectUiStore";
import { useCategories } from "./useCategories";
import { useProjects } from "./useProjects";

export function useStaleSelectionReset() {
  const { data: categories } = useCategories();
  const { data: projects } = useProjects();
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const selectedProjectId = useProjectUiStore((state) => state.selectedProjectId);
  const setSelectedCategoryId = useProjectUiStore((state) => state.setSelectedCategoryId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);

  useEffect(() => {
    if (
      categories &&
      selectedCategoryId !== allProjectsCategoryId &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(allProjectsCategoryId);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

  useEffect(() => {
    if (projects && selectedProjectId && !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);
}
