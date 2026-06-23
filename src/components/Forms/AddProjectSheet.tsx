import { useEffect, useState, type FormEvent } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, X } from "lucide-react";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { emptyProjectDraft, projectAccentColors } from "../../lib/constants";
import { formatTags, parseTags, pathBasename } from "../../lib/formUtils";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, CommandTemplate, Project, ProjectDraft } from "../../lib/types";

type AddProjectSheetProps = {
  categories: Category[];
  commandTemplates: CommandTemplate[];
  projects: Project[];
};

export function AddProjectSheet({ categories, commandTemplates, projects }: AddProjectSheetProps) {
  const isOpen = useProjectUiStore((state) => state.isProjectSheetOpen);
  const setOpen = useProjectUiStore((state) => state.setProjectSheetOpen);
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const editingProjectId = useProjectUiStore((state) => state.editingProjectId);
  const [draft, setDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [tags, setTags] = useState("");
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const editingProject = projects.find((project) => project.id === editingProjectId) ?? null;

  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        setDraft({
          name: editingProject.name,
          description: editingProject.description ?? "",
          path: editingProject.path,
          categoryId: editingProject.categoryId,
          color: editingProject.color,
          tags: editingProject.tags,
          pinnedCommands: editingProject.pinnedCommands,
          hidden: editingProject.hidden,
          sortOrder: editingProject.sortOrder,
        });
        setTags(formatTags(editingProject.tags));
      } else {
        setDraft({
          ...emptyProjectDraft,
          categoryId: selectedCategoryId === "all" ? null : selectedCategoryId,
        });
        setTags("");
      }
    }
  }, [editingProject, isOpen, selectedCategoryId]);

  const updateDraft = <Key extends keyof ProjectDraft>(key: Key, value: ProjectDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handlePathChange = (path: string) => {
    setDraft((current) => ({
      ...current,
      path,
      name: current.name || pathBasename(path),
    }));
  };

  const chooseFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (typeof selected === "string") {
      handlePathChange(selected);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.path.trim()) {
      return;
    }

    const project = {
      ...draft,
      name: draft.name.trim(),
      path: draft.path.trim(),
      description: draft.description.trim(),
      tags: parseTags(tags),
    };

    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, project },
        {
          onSuccess: () => setOpen(false),
        },
      );
      return;
    }

    createProject.mutate(project, {
      onSuccess: () => setOpen(false),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/25 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/70 bg-[#fbfaf7] shadow-2xl shadow-zinc-950/20 dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold">{editingProject ? "Edit Project" : "New Project"}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Folder path</span>
            <div className="flex gap-2">
              <input
                value={draft.path}
                readOnly
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                placeholder="/Users/name/work/project"
              />
              <button
                type="button"
                onClick={chooseFolder}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium shadow-sm dark:border-zinc-800"
              >
                <FolderOpen size={15} />
                Browse
              </button>
            </div>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Name</span>
            <input
              value={draft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              className="min-h-24 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select
              value={draft.categoryId ?? ""}
              onChange={(event) => updateDraft("categoryId", event.target.value || null)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Tags</span>
            <input
              value={tags || formatTags(draft.tags)}
              onChange={(event) => setTags(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="frontend, client, archived"
            />
          </label>

          <div className="space-y-2">
            <div className="text-sm font-medium">Color</div>
            <div className="flex flex-wrap gap-2">
              {projectAccentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => updateDraft("color", color)}
                  className="h-7 w-7 rounded-full border border-black/10"
                  style={{
                    backgroundColor: color,
                    boxShadow: draft.color === color ? "0 0 0 2px #18181b" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Pinned Commands</div>
            {commandTemplates.length ? (
              <div className="space-y-2">
                {commandTemplates.map((template) => {
                  const checked = draft.pinnedCommands.includes(template.id);

                  return (
                    <label
                      key={template.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const pinnedCommands = event.target.checked
                            ? [...draft.pinnedCommands, template.id]
                            : draft.pinnedCommands.filter((id) => id !== template.id);
                          updateDraft("pinnedCommands", pinnedCommands);
                        }}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{template.label}</span>
                        <span className="block truncate font-mono text-xs text-zinc-500">{template.command}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-zinc-200 px-3 py-3 text-sm text-zinc-500 dark:border-zinc-800">
                Create command templates in Settings.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <button type="submit" className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-zinc-950/15">
            {editingProject ? "Save Changes" : "Add Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
