import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { allProjectsCategoryId } from "../lib/constants";
import { projectsQueryKey } from "./useProjects";
import type { DividerDraft, ReorderItem } from "../lib/types";

export const dividersQueryKey = (categoryId: string | null) => ["dividers", categoryId ?? "all"];

const resolveCategoryId = (categoryId: string) =>
  categoryId === allProjectsCategoryId ? null : categoryId;

export const useDividers = (categoryId: string) =>
  useQuery({
    queryKey: dividersQueryKey(resolveCategoryId(categoryId)),
    queryFn: () => api.listDividers(resolveCategoryId(categoryId)),
  });

export const useDividerActions = (categoryId: string) => {
  const queryClient = useQueryClient();
  const resolvedId = resolveCategoryId(categoryId);
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: dividersQueryKey(resolvedId) });
    queryClient.invalidateQueries({ queryKey: projectsQueryKey });
  };

  return {
    createDivider: useMutation({
      mutationFn: (divider: DividerDraft) => api.createDivider(divider),
      onSuccess: invalidate,
    }),
    updateDivider: useMutation({
      mutationFn: ({ id, divider }: { id: string; divider: Partial<DividerDraft> }) =>
        api.updateDivider(id, divider),
      onSuccess: invalidate,
    }),
    deleteDivider: useMutation({
      mutationFn: (id: string) => api.deleteDivider(id),
      onSuccess: invalidate,
    }),
    reorderListItems: useMutation({
      mutationFn: (items: ReorderItem[]) => api.reorderListItems(items),
      onSuccess: invalidate,
    }),
  };
};
