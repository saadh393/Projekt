import { useEffect, useState, type FormEvent } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, X } from "lucide-react";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { useMountTransition } from "../../hooks/useMountTransition";
import { emptyProjectDraft, projectAccentColors } from "../../lib/constants";
import { formatTags, parseTags, pathBasename } from "../../lib/formUtils";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, Project, ProjectDraft } from "../../lib/types";
import { SheetField } from "./SheetField";

type AddProjectSheetProps = {
  categories: Category[];
  projects: Project[];
};

export function AddProjectSheet({ categories, projects }: AddProjectSheetProps) {
  const isOpen = useProjectUiStore((state) => state.isProjectSheetOpen);
  const setOpen = useProjectUiStore((state) => state.setProjectSheetOpen);
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const editingProjectId = useProjectUiStore((state) => state.editingProjectId);
  const [draft, setDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [tags, setTags] = useState("");
  const { render, state } = useMountTransition(isOpen, 320);
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
    const selected = await open({ directory: true, multiple: false });

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
        { onSuccess: () => setOpen(false) },
      );
      return;
    }

    createProject.mutate(project, { onSuccess: () => setOpen(false) });
  };

  if (!render) {
    return null;
  }

  return (
    <>
      <div className="sheet-backdrop" data-state={state} onClick={() => setOpen(false)} />
      <form onSubmit={handleSubmit} className="sheet-panel z-50" data-state={state}>
        <div
          className="flex items-center justify-between border-b px-5"
          style={{ borderColor: "var(--border-divider)", height: 52 }}
        >
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {editingProject ? "Edit Project" : "New Project"}
          </h2>
          <button type="button" onClick={() => setOpen(false)} className="btn-icon" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <SheetField label="Folder">
            <div className="flex gap-1.5">
              <input
                value={draft.path}
                readOnly
                className="field field-mono flex-1"
                placeholder="/Users/name/work/project"
              />
              <button type="button" onClick={chooseFolder} className="btn">
                <FolderOpen size={13} />
                Browse
              </button>
            </div>
          </SheetField>

          <SheetField label="Name">
            <input
              value={draft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              className="field"
              placeholder="My project"
            />
          </SheetField>

          <SheetField label="Description">
            <textarea
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              className="field field-multiline"
              placeholder="What is this project?"
            />
          </SheetField>

          <SheetField label="Category">
            <select
              value={draft.categoryId ?? ""}
              onChange={(event) => updateDraft("categoryId", event.target.value || null)}
              className="field appearance-none pr-7"
            >
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </SheetField>

          <SheetField label="Tags">
            <input
              value={tags || formatTags(draft.tags)}
              onChange={(event) => setTags(event.target.value)}
              className="field"
              placeholder="frontend, client, archived"
            />
          </SheetField>

          <SheetField label="Color">
            <div className="flex flex-wrap gap-2">
              {projectAccentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => updateDraft("color", color)}
                  className="h-6 w-6 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      draft.color === color
                        ? "0 0 0 2px #fff, 0 0 0 4px var(--accent)"
                        : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>
          </SheetField>

        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-divider)" }}
        >
          <button type="button" onClick={() => setOpen(false)} className="btn">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingProject ? "Save Changes" : "Add Project"}
          </button>
        </div>
      </form>
    </>
  );
}
