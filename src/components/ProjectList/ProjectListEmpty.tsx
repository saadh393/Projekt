import { FolderPlus } from "lucide-react";

type ProjectListEmptyProps = {
  onAddProject: () => void;
};

export function ProjectListEmpty({ onAddProject }: ProjectListEmptyProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}
      >
        <FolderPlus size={20} />
      </div>
      <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
        No projects yet
      </h3>
      <p className="mt-1 max-w-xs text-[13px]" style={{ color: "var(--text-secondary)" }}>
        Add a folder to start tracking your projects, tags, and launchers in one place.
      </p>
      <button type="button" onClick={onAddProject} className="btn btn-primary mt-4">
        New Project
      </button>
    </div>
  );
}
