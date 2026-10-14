import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useProjectUiStore } from "../store/useProjectUiStore";
import type { GeneralSettings } from "../lib/types";

export const settingsQueryKey = ["settings"];

export const useSettings = () =>
  useQuery({
    queryKey: settingsQueryKey,
    queryFn: api.getSettings,
  });

export const useUpdateRememberSession = () => {
  const setRememberSession = useProjectUiStore((state) => state.setRememberSession);

  return useMutation({
    scope: { id: "remember-session" },
    mutationFn: (remember: boolean) => api.setRememberSession(remember),
    onSuccess: setRememberSession,
    onError: (error) => console.error("Failed to update session preference", error),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<GeneralSettings>) => api.updateSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsQueryKey }),
  });
};
