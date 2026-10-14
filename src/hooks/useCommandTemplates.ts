import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CommandTemplate, CommandTemplateDraft, CommandValues } from "../lib/types";

export const commandTemplatesQueryKey = (projectId: string | null) => [
  "command-templates",
  projectId ?? "global",
];

const reorderProjectCommandsKey = ["reorder-project-commands"];

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
    linkGlobalCommands: useMutation({
      mutationFn: ({ projectId, templateIds }: { projectId: string; templateIds: string[] }) =>
        api.linkGlobalCommands(projectId, templateIds),
      onSuccess: invalidate,
    }),
    unlinkGlobalCommand: useMutation({
      mutationFn: ({ projectId, templateId }: { projectId: string; templateId: string }) =>
        api.unlinkGlobalCommand(projectId, templateId),
      onSuccess: invalidate,
    }),
    overrideProjectCommand: useMutation({
      mutationFn: ({
        projectId,
        templateId,
        values,
      }: {
        projectId: string;
        templateId: string;
        values: CommandValues;
      }) => api.overrideProjectCommand(projectId, templateId, values),
      onSuccess: invalidate,
    }),
    resetProjectCommandOverride: useMutation({
      mutationFn: ({ projectId, templateId }: { projectId: string; templateId: string }) =>
        api.resetProjectCommandOverride(projectId, templateId),
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
      mutationKey: reorderProjectCommandsKey,
      scope: { id: "reorder-project-commands" },
      onMutate: async ({ projectId, templateIds }) => {
        const queryKey = commandTemplatesQueryKey(projectId);
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<CommandTemplate[]>(queryKey);
        const position = new Map(templateIds.map((id, index) => [id, index]));
        queryClient.setQueryData<CommandTemplate[]>(queryKey, (templates) =>
          templates && [...templates].sort(
            (a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity),
          ),
        );
        return previous;
      },
      onError: (error, { projectId }, previous) => {
        console.error("Failed to reorder project commands", error);
        queryClient.setQueryData(commandTemplatesQueryKey(projectId), previous);
      },
      onSettled: () => {
        if (queryClient.isMutating({ mutationKey: reorderProjectCommandsKey }) === 1) {
          void invalidate();
        }
      },
    }),
    setProjectCommandHidden: useMutation({
      mutationFn: ({
        projectId,
        templateId,
        hidden,
      }: {
        projectId: string;
        templateId: string;
        hidden: boolean;
      }) => api.setProjectCommandHidden(projectId, templateId, hidden),
      onSuccess: invalidate,
    }),
  };
};
