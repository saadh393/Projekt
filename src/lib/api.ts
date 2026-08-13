import { invoke } from "@tauri-apps/api/core";
import type {
  AppLauncher,
  Category,
  CategoryDraft,
  CommandTemplate,
  CommandTemplateDraft,
  CommandRunResult,
  Divider,
  DividerDraft,
  GeneralSettings,
  LauncherDraft,
  Project,
  ProjectDraft,
  ReorderItem,
  ShellPreference,
  SortMode,
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
  deleteProject: (id: string) => call<void>("delete_project", { id }),
  reorderProjects: (ids: string[]) => call<Project[]>("reorder_projects", { ids }),
  openFinder: (projectId: string) => call<void>("open_project_in_finder", { projectId }),
  openVsCode: (projectId: string) => call<void>("open_project_in_vscode", { projectId }),
  openAntigravity: (projectId: string) => call<void>("open_project_in_antigravity", { projectId }),
  openTerminal: (projectId: string) => call<void>("open_project_in_terminal", { projectId }),
  runCommandTemplate: (projectId: string, templateId: string) =>
    call<CommandRunResult>("run_project_command_template", { projectId, templateId }),
  openWithLauncher: (projectId: string, launcherId: string) =>
    call<void>("launch_project_app", { projectId, launcherId }),

  listCategories: () => call<Category[]>("list_categories"),
  createCategory: (category: CategoryDraft) => call<Category>("create_category", { input: category }),
  updateCategory: (id: string, category: Partial<CategoryDraft>) =>
    call<Category>("update_category", { id, input: category }),
  hideCategory: (id: string, hidden: boolean) =>
    call<Category>("set_category_hidden", { id, hidden }),
  reorderCategories: (ids: string[]) => call<Category[]>("reorder_categories", { ids }),
  deleteCategory: (id: string) => call<void>("delete_category", { id }),

  listLaunchers: () => call<AppLauncher[]>("list_app_launchers"),
  createLauncher: (launcher: LauncherDraft) =>
    call<AppLauncher>("create_app_launcher", { input: launcher }),
  deleteLauncher: (id: string) => call<void>("delete_app_launcher", { id }),

  listDividers: (categoryId: string | null) =>
    call<Divider[]>("list_dividers", { categoryId }),
  createDivider: (divider: DividerDraft) =>
    call<Divider>("create_divider", { input: divider }),
  updateDivider: (id: string, divider: Partial<DividerDraft>) =>
    call<Divider>("update_divider", { id, input: divider }),
  deleteDivider: (id: string) => call<void>("delete_divider", { id }),
  reorderListItems: (items: ReorderItem[]) =>
    call<void>("reorder_list_items", { items }),

  listCommandTemplates: (projectId: string | null = null) =>
    call<CommandTemplate[]>("list_command_templates", { projectId }),
  createCommandTemplate: (template: CommandTemplateDraft) =>
    call<CommandTemplate>("create_command_template", { input: template }),
  updateCommandTemplate: (id: string, template: Partial<CommandTemplateDraft>) =>
    call<CommandTemplate>("update_command_template", { id, input: template }),
  deleteCommandTemplate: (id: string) => call<void>("delete_command_template", { id }),
  reorderProjectCommands: (projectId: string, templateIds: string[]) =>
    call<void>("reorder_project_commands", { projectId, templateIds }),
  setProjectCommandHidden: (
    projectId: string,
    templateId: string,
    hidden: boolean,
  ) =>
    call<void>("set_project_command_hidden", {
      projectId,
      commandTemplateId: templateId,
      hidden,
    }),

  getProjectSortMode: () => call<SortMode>("get_project_sort_mode"),
  setProjectSortMode: (mode: SortMode) =>
    call<SortMode>("set_project_sort_mode", { mode }),
  getShowHiddenProjects: () => call<boolean>("get_show_hidden_projects"),
  setShowHiddenProjects: (show: boolean) =>
    call<boolean>("set_show_hidden_projects", { show }),

  writeTerminalSession: (sessionId: string, data: number[]) =>
    call<void>("write_terminal_session", { sessionId, data }),
  resizeTerminalSession: (sessionId: string, rows: number, cols: number) =>
    call<void>("resize_terminal_session", { sessionId, rows, cols }),
  killTerminalSession: (sessionId: string) =>
    call<void>("kill_terminal_session", { sessionId }),

  getSettings: async (): Promise<GeneralSettings> => {
    const [preferredTerminal, preferredShell, availableShells] = await Promise.all([
      call<TerminalPreference>("get_preferred_terminal"),
      call<ShellPreference>("get_preferred_shell"),
      call<ShellPreference[]>("list_available_shells"),
    ]);

    return { preferredTerminal, preferredShell, availableShells };
  },
  updateSettings: async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    if (settings.preferredTerminal) {
      await call<TerminalPreference>("set_preferred_terminal", {
        terminal: settings.preferredTerminal,
      });
    }

    if (settings.preferredShell) {
      await call<ShellPreference>("set_preferred_shell", {
        shell: settings.preferredShell,
      });
    }

    return api.getSettings();
  },
};
