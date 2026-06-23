import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CommandTemplateDraft } from "../lib/types";

export const commandTemplatesQueryKey = ["command-templates"];

export const useCommandTemplates = () =>
  useQuery({
    queryKey: commandTemplatesQueryKey,
    queryFn: api.listCommandTemplates,
  });

export const useCommandTemplateActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: commandTemplatesQueryKey });

  return {
    createCommandTemplate: useMutation({
      mutationFn: (template: CommandTemplateDraft) => api.createCommandTemplate(template),
      onSuccess: invalidate,
    }),
    updateCommandTemplate: useMutation({
      mutationFn: ({ id, template }: { id: string; template: Partial<CommandTemplateDraft> }) =>
        api.updateCommandTemplate(id, template),
      onSuccess: invalidate,
    }),
    deleteCommandTemplate: useMutation({
      mutationFn: (id: string) => api.deleteCommandTemplate(id),
      onSuccess: invalidate,
    }),
  };
};
