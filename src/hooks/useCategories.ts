import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category, CategoryDraft } from "../lib/types";

export const categoriesQueryKey = ["categories"];

const reorderCategoriesKey = ["reorder-categories"];

export const useCategories = () =>
  useQuery({
    queryKey: categoriesQueryKey,
    queryFn: api.listCategories,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryDraft) => api.createCategory(category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
};

export const useCategoryActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey });

  return {
    updateCategory: useMutation({
      mutationFn: ({ id, category }: { id: string; category: Partial<CategoryDraft> }) =>
        api.updateCategory(id, category),
      onSuccess: invalidate,
    }),
    reorderCategories: useMutation({
      mutationKey: reorderCategoriesKey,
      scope: { id: "reorder-categories" },
      mutationFn: (ids: string[]) => api.reorderCategories(ids),
      onMutate: async (ids) => {
        await queryClient.cancelQueries({ queryKey: categoriesQueryKey });
        const previous = queryClient.getQueryData<Category[]>(categoriesQueryKey);
        const sortOrders = new Map(ids.map((id, index) => [id, index]));
        queryClient.setQueryData<Category[]>(categoriesQueryKey, (categories) =>
          categories?.map((category) => ({
            ...category,
            sortOrder: sortOrders.get(category.id) ?? category.sortOrder,
          })),
        );
        return previous;
      },
      onError: (error, _ids, previous) => {
        console.error("Failed to reorder categories", error);
        queryClient.setQueryData(categoriesQueryKey, previous);
      },
      onSettled: () => {
        if (queryClient.isMutating({ mutationKey: reorderCategoriesKey }) === 1) {
          void invalidate();
        }
      },
    }),
    deleteCategory: useMutation({
      mutationFn: (id: string) => api.deleteCategory(id),
      onSuccess: invalidate,
    }),
  };
};
