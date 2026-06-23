import type { Category, Project } from "./types";

const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const orderedMatchScore = (target: string, query: string) => {
  let score = 0;
  let cursor = 0;

  for (const character of query) {
    const index = target.indexOf(character, cursor);
    if (index === -1) {
      return 0;
    }

    score += index === cursor ? 3 : 1;
    cursor = index + 1;
  }

  return score;
};

export const fuzzyScore = (target: string, query: string) => {
  const text = compact(target);
  const needle = compact(query);

  if (!needle) {
    return 1;
  }

  if (text === needle) {
    return 100;
  }

  if (text.startsWith(needle)) {
    return 75;
  }

  if (text.includes(needle)) {
    return 50;
  }

  return orderedMatchScore(text, needle);
};

export const projectSearchText = (project: Project, category?: Category) =>
  [
    project.name,
    project.description,
    project.path,
    project.categoryName,
    category?.name,
    ...project.tags,
  ]
    .filter(Boolean)
    .join(" ");

export const filterProjectsByQuery = (
  projects: Project[],
  categories: Category[],
  query: string,
) => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const value = query.trim();

  if (!value) {
    return projects;
  }

  return projects
    .map((project) => ({
      project,
      score: fuzzyScore(
        projectSearchText(
          project,
          project.categoryId ? categoryById.get(project.categoryId) : undefined,
        ),
        value,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.project);
};
