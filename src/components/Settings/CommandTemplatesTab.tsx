import { CommandManager } from "../Commands/CommandManager";

export function CommandTemplatesTab() {
  return (
    <div className="space-y-3">
      <CommandManager
        projectId={null}
        title={
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Global Commands
          </h3>
        }
      />
    </div>
  );
}
