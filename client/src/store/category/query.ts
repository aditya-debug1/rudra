// src/hooks/useCategories.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi, InventoryCategoryType, PrecedenceItem } from "./api";

const CATEGORIES_KEY = ["categories"];

export const useCategories = () => {
  const queryClient = useQueryClient();

  /** List */
  const useCategoriesList = () =>
    useQuery({
      queryKey: CATEGORIES_KEY,
      queryFn: categoryApi.getCategories,
      staleTime: 60 * 1000,
      placeholderData: (prev) => prev,
    });

  /** Create */
  const createCategoryMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
    onError: (err) => console.error("Create category failed:", err),
  });

  /** Update (optimistic) */
  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof categoryApi.updateCategory>[1];
    }) => categoryApi.updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
      const prev =
        queryClient.getQueryData<InventoryCategoryType[]>(CATEGORIES_KEY);

      if (prev) {
        queryClient.setQueryData(
          CATEGORIES_KEY,
          prev.map((c) =>
            c._id === id
              ? { ...c, ...data, updatedAt: new Date().toISOString() }
              : c,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CATEGORIES_KEY, ctx.prev);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });

  /** Delete (optimistic) */
  const deleteCategoryMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
      const prev =
        queryClient.getQueryData<InventoryCategoryType[]>(CATEGORIES_KEY);

      if (prev) {
        queryClient.setQueryData(
          CATEGORIES_KEY,
          prev.filter((c) => c._id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CATEGORIES_KEY, ctx.prev);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });

  /** Bulk precedence (optimistic reorder to match server sort) */
  const setPrecedenceMutation = useMutation({
    mutationFn: categoryApi.setPrecedence,
    onMutate: async (items: PrecedenceItem[]) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
      const prev =
        queryClient.getQueryData<InventoryCategoryType[]>(CATEGORIES_KEY);

      if (prev) {
        const map = new Map(
          items.map(({ id, precedence }) => [id, precedence]),
        );
        const next = prev
          .map((c) =>
            map.has(c._id) ? { ...c, precedence: map.get(c._id)! } : c,
          )
          .sort((a, b) => {
            if (a.precedence !== b.precedence)
              return a.precedence - b.precedence;
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ); // createdAt desc
          });

        queryClient.setQueryData(CATEGORIES_KEY, next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CATEGORIES_KEY, ctx.prev);
    },
    onSuccess: (data) => {
      // If backend returns updated docs, merge them in and keep the same sort
      if (data?.updated?.length) {
        queryClient.setQueryData(
          CATEGORIES_KEY,
          (old?: InventoryCategoryType[]) => {
            if (!old) return data.updated;
            const byId = new Map(old.map((c) => [c._id, c]));
            data.updated.forEach((c) => byId.set(c._id, c));
            return Array.from(byId.values()).sort((a, b) => {
              if (a.precedence !== b.precedence)
                return a.precedence - b.precedence;
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });
          },
        );
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });

  return {
    useCategoriesList,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    setPrecedenceMutation,
  };
};
