import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useLauncherActions } from "../../hooks/useLaunchers";

export function AddLauncherForm() {
  const [label, setLabel] = useState("");
  const [appPath, setAppPath] = useState("");
  const { createLauncher } = useLauncherActions();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!label.trim() || !appPath.trim()) {
      return;
    }

    createLauncher.mutate(
      { label: label.trim(), appPath: appPath.trim() },
      {
        onSuccess: () => {
          setLabel("");
          setAppPath("");
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-[10px] border p-3"
      style={{ borderColor: "var(--border-subtle)", background: "rgba(0,0,0,0.018)" }}
    >
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        className="field"
        placeholder="Label (e.g. Cursor)"
      />
      <input
        value={appPath}
        onChange={(event) => setAppPath(event.target.value)}
        className="field field-mono"
        placeholder="/Applications/App.app"
      />
      <button type="submit" className="btn btn-primary w-full">
        <Plus size={13} />
        Add Launcher
      </button>
    </form>
  );
}
