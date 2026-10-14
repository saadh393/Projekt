import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { allProjectsCategoryId } from "../lib/constants";
import { projectsQueryKey } from "./useProjects";
import type { DividerDraft, ListItemOrder } from "../lib/types";

export const dividersQueryKey = (categoryId: string | null) => ["dividers", categoryId ?? "all"];

const resolveCategoryId = (categoryId: string) =>
  categoryId === allProjectsCategoryId ? null : categoryId;

const reorderListItemsKey = ["reorder-list-items"];

type Sortable = { id: string; sortOrder: number };

const withSortOrders =
  (orders: Map<string, number>) =>
  <T extends Sortable>(items: T[] | undefined) =>
    items?.map((item) => {
      const sortOrder = orders.get(item.id);
      return sortOrder === undefined ? item : { ...item, sortOrder };
    });

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
      mutationKey: reorderListItemsKey,
      scope: { id: "reorder-list-items" },
      mutationFn: (orders: ListItemOrder[]) => api.reorderListItems(orders),
      onMutate: async (orders) => {
        const dividersKey = dividersQueryKey(resolvedId);
        await Promise.all([
          queryClient.cancelQueries({ queryKey: projectsQueryKey }),
          queryClient.cancelQueries({ queryKey: dividersKey }),
        ]);
        const previous = {
          projects: queryClient.getQueryData(projectsQueryKey),
          dividers: queryClient.getQueryData(dividersKey),
        };
        const apply = withSortOrders(new Map(orders.map((order) => [order.id, order.sortOrder])));
        queryClient.setQueryData(projectsQueryKey, apply);
        queryClient.setQueryData(dividersKey, apply);
        return previous;
      },
      onError: (error, _orders, previous) => {
        console.error("Failed to reorder list items", error);
        queryClient.setQueryData(projectsQueryKey, previous?.projects);
        queryClient.setQueryData(dividersQueryKey(resolvedId), previous?.dividers);
      },
      onSettled: () => {
        if (queryClient.isMutating({ mutationKey: reorderListItemsKey }) === 1) {
          invalidate();
        }
      },
    }),
  };
};
