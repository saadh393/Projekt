import { arrayMove } from "@dnd-kit/sortable";
import type { Divider, ListItem, ListItemOrder, Project } from "./types";

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

export const sortOrdersAfterMove = (
  items: ListItem[],
  fromIndex: number,
  toIndex: number,
): ListItemOrder[] => {
  const slots = items.map((entry) => entry.item.sortOrder).sort((a, b) => a - b);
  for (let index = 1; index < slots.length; index++) {
    slots[index] = Math.max(slots[index], slots[index - 1] + 1);
  }

  return arrayMove(items, fromIndex, toIndex).flatMap((entry, index) =>
    entry.item.sortOrder === slots[index]
      ? []
      : [{ kind: entry.kind, id: entry.item.id, sortOrder: slots[index] }],
  );
};

export const nextDividerSortOrder = (items: ListItem[]) => {
  if (!items.length) return 0;
  return Math.max(...items.map((entry) => entry.item.sortOrder)) + 1;
};
