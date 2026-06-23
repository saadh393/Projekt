import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CategoryDraft } from "../lib/types";

export const categoriesQueryKey = ["categories"];

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
      mutationFn: (ids: string[]) => api.reorderCategories(ids),
      onSuccess: invalidate,
    }),
    deleteCategory: useMutation({
      mutationFn: (id: string) => api.deleteCategory(id),
      onSuccess: invalidate,
    }),
  };
};
