import { invoke } from "@tauri-apps/api/core";
import type {
  AppLauncher,
  Category,
  CategoryDraft,
  CommandTemplate,
  CommandTemplateDraft,
  GeneralSettings,
  LauncherDraft,
  Project,
  ProjectDraft,
  TerminalPreference,
} from "./types";

const call = <T>(command: string, payload?: Record<string, unknown>) =>
  invoke<T>(command, payload);

export const api = {
  listProjects: () =>
    call<Project[]>("list_projects", {
      filter: { showHidden: true, sort: "manual" },
    }),
  createProject: (project: ProjectDraft) => call<Project>("create_project", { input: project }),
  updateProject: (id: string, project: Partial<ProjectDraft>) =>
    call<Project>("update_project", { id, input: project }),
  hideProject: (id: string, hidden: boolean) =>
    call<Project>("set_project_hidden", { id, hidden }),
  reorderProjects: (ids: string[]) => call<Project[]>("reorder_projects", { ids }),
  openFinder: (projectId: string) => call<void>("open_project_in_finder", { projectId }),
  openVsCode: (projectId: string) => call<void>("open_project_in_vscode", { projectId }),
  openTerminal: (projectId: string) => call<void>("open_project_in_terminal", { projectId }),
  runCommandTemplate: (projectId: string, templateId: string) =>
    call<void>("run_project_command_template", { projectId, templateId }),
  openWithLauncher: (projectId: string, launcherId: string) =>
    call<void>("launch_project_app", { projectId, launcherId }),

  listCategories: () => call<Category[]>("list_categories"),
  createCategory: (category: CategoryDraft) => call<Category>("create_category", { input: category }),
  updateCategory: (id: string, category: Partial<CategoryDraft>) =>
    call<Category>("update_category", { id, input: category }),
  hideCategory: (id: string, hidden: boolean) =>
    call<Category>("set_category_hidden", { id, hidden }),
  deleteCategory: (id: string) => call<void>("delete_category", { id }),

  listLaunchers: () => call<AppLauncher[]>("list_app_launchers"),
  createLauncher: (launcher: LauncherDraft) =>
    call<AppLauncher>("create_app_launcher", { input: launcher }),
  deleteLauncher: (id: string) => call<void>("delete_app_launcher", { id }),

  listCommandTemplates: () => call<CommandTemplate[]>("list_command_templates"),
  createCommandTemplate: (template: CommandTemplateDraft) =>
    call<CommandTemplate>("create_command_template", { input: template }),
  updateCommandTemplate: (id: string, template: Partial<CommandTemplateDraft>) =>
    call<CommandTemplate>("update_command_template", { id, input: template }),
  deleteCommandTemplate: (id: string) => call<void>("delete_command_template", { id }),

  getSettings: async (): Promise<GeneralSettings> => ({
    preferredTerminal: await call<TerminalPreference>("get_preferred_terminal"),
  }),
  updateSettings: async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    if (settings.preferredTerminal) {
      await call<TerminalPreference>("set_preferred_terminal", {
        terminal: settings.preferredTerminal,
      });
    }

    return api.getSettings();
  },
};
