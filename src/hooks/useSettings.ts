import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { GeneralSettings } from "../lib/types";

export const settingsQueryKey = ["settings"];

export const useSettings = () =>
  useQuery({
    queryKey: settingsQueryKey,
    queryFn: api.getSettings,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<GeneralSettings>) => api.updateSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsQueryKey }),
  });
};
