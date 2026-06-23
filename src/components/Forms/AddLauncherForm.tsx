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
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        placeholder="Label"
      />
      <input
        value={appPath}
        onChange={(event) => setAppPath(event.target.value)}
        className="rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900"
        placeholder="/Applications/App.app"
      />
      <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 text-sm text-white">
        <Plus size={15} />
        Add Launcher
      </button>
    </form>
  );
}
