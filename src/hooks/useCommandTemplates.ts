import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CommandTemplateDraft } from "../lib/types";

export const commandTemplatesQueryKey = (projectId: string | null) => [
  "command-templates",
  projectId ?? "global",
];

export const useCommandTemplates = (projectId: string | null = null) =>
  useQuery({
    queryKey: commandTemplatesQueryKey(projectId),
    queryFn: () => api.listCommandTemplates(projectId),
  });

export const useCommandTemplateActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["command-templates"] });

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
    reorderProjectCommands: useMutation({
      mutationFn: ({
        projectId,
        templateIds,
      }: {
        projectId: string;
        templateIds: string[];
      }) => api.reorderProjectCommands(projectId, templateIds),
      onSuccess: invalidate,
    }),
  };
};
