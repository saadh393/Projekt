import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ProjectDraft } from "../lib/types";

export const projectsQueryKey = ["projects"];

export const useProjects = () =>
  useQuery({
    queryKey: projectsQueryKey,
    queryFn: api.listProjects,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectDraft) => api.createProject(project),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsQueryKey }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: { id: string; project: ProjectDraft }) =>
      api.updateProject(id, project),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsQueryKey }),
  });
};

export const useProjectActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: projectsQueryKey });

  return {
    hideProject: useMutation({
      mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) =>
        api.hideProject(id, hidden),
      onSuccess: invalidate,
    }),
    deleteProject: useMutation({
      mutationFn: (id: string) => api.deleteProject(id),
      onSuccess: invalidate,
    }),
    reorderProjects: useMutation({
      mutationFn: (ids: string[]) => api.reorderProjects(ids),
      onSuccess: invalidate,
    }),
    openFinder: useMutation({
      mutationFn: (projectId: string) => api.openFinder(projectId),
      onSuccess: invalidate,
    }),
    openVsCode: useMutation({
      mutationFn: (projectId: string) => api.openVsCode(projectId),
      onSuccess: invalidate,
    }),
    openTerminal: useMutation({
      mutationFn: (projectId: string) => api.openTerminal(projectId),
      onSuccess: invalidate,
    }),
    runCommandTemplate: useMutation({
      mutationFn: ({ projectId, templateId }: { projectId: string; templateId: string }) =>
        api.runCommandTemplate(projectId, templateId),
      onSuccess: invalidate,
    }),
    openWithLauncher: useMutation({
      mutationFn: ({ projectId, launcherId }: { projectId: string; launcherId: string }) =>
        api.openWithLauncher(projectId, launcherId),
      onSuccess: invalidate,
    }),
  };
};
