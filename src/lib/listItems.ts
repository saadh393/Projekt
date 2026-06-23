import type { Divider, ListItem, Project, ReorderItem } from "./types";

export const mergeListItems = (projects: Project[], dividers: Divider[]): ListItem[] => {
  const items: ListItem[] = [
    ...projects.map((project) => ({ kind: "project" as const, item: project })),
    ...dividers.map((divider) => ({ kind: "divider" as const, item: divider })),
  ];

  return items.sort((a, b) => {
    const left = a.item.sortOrder;
    const right = b.item.sortOrder;
    if (left !== right) return left - right;
    return a.kind === b.kind ? 0 : a.kind === "divider" ? -1 : 1;
  });
};

export const toReorderItems = (items: ListItem[]): ReorderItem[] =>
  items.map((entry) => ({ kind: entry.kind, id: entry.item.id }));

export const nextDividerSortOrder = (items: ListItem[]) => {
  if (!items.length) return 0;
  return Math.max(...items.map((entry) => entry.item.sortOrder)) + 1;
};
