import type { Project, SortMode } from "./types";

const compareNullableTime = (left: number | null, right: number | null) => {
  if (left === right) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return right - left;
};

export const sortProjects = (projects: Project[], sortMode: SortMode) => {
  const sorted = [...projects];

  if (sortMode === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortMode === "createdAt") {
    return sorted.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (sortMode === "lastOpenedAt") {
    return sorted.sort((a, b) => compareNullableTime(a.lastOpenedAt, b.lastOpenedAt));
  }

  return sorted.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const visibleProjects = (projects: Project[], showHidden: boolean) => {
  if (showHidden) {
    return projects;
  }

  return projects.filter((project) => !project.hidden);
};

export const projectsForCategory = (projects: Project[], categoryId: string) => {
  if (categoryId === "all") {
    return projects;
  }

  return projects.filter((project) => project.categoryId === categoryId);
};
