import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { LauncherDraft } from "../lib/types";

export const launchersQueryKey = ["launchers"];

export const useLaunchers = () =>
  useQuery({
    queryKey: launchersQueryKey,
    queryFn: api.listLaunchers,
  });

export const useLauncherActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: launchersQueryKey });

  return {
    createLauncher: useMutation({
      mutationFn: (launcher: LauncherDraft) => api.createLauncher(launcher),
      onSuccess: invalidate,
    }),
    deleteLauncher: useMutation({
      mutationFn: (id: string) => api.deleteLauncher(id),
      onSuccess: invalidate,
    }),
  };
};
