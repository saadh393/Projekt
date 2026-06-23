import type { Category, Project } from "./types";

export const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

export const visibleCategories = (categories: Category[]) => sortCategories(categories);

export const countProjectsByCategory = (projects: Project[]) =>
  projects.reduce<Record<string, number>>((counts, project) => {
    if (!project.categoryId || project.hidden) {
      return counts;
    }

    return {
      ...counts,
      [project.categoryId]: (counts[project.categoryId] ?? 0) + 1,
    };
  }, {});

export const findCategoryName = (categories: Category[], id: string | null) =>
  categories.find((category) => category.id === id)?.name ?? "Unassigned";
