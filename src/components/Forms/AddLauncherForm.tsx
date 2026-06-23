import { useState, type FormEvent } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { AppWindowMac, FolderOpen, Plus } from "lucide-react";
import { useLauncherActions } from "../../hooks/useLaunchers";
import { formatLauncherName, isMacAppPath } from "../../lib/launcherUtils";

export function AddLauncherForm() {
  const [label, setLabel] = useState("");
  const [appPath, setAppPath] = useState("");
  const { createLauncher } = useLauncherActions();
  const canSubmit = Boolean(label.trim() && appPath.trim() && isMacAppPath(appPath));

  const handleAppPathChange = (path: string) => {
    setAppPath(path);
    setLabel((current) => current || formatLauncherName(path));
  };

  const chooseApp = async () => {
    const selected = await open({
      defaultPath: "/Applications",
      filters: [{ name: "macOS Apps", extensions: ["app"] }],
      multiple: false,
      title: "Choose Application",
    });

    if (typeof selected === "string") {
      handleAppPathChange(selected);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
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
      className="space-y-3 rounded-[10px] border bg-white p-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <AppWindowMac size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Install App Launcher
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Pick a macOS .app bundle and it will appear in project actions.
          </div>
        </div>
      </div>
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        className="field"
        placeholder="Label (e.g. Cursor)"
      />
      <div className="flex gap-1.5">
        <input
          value={appPath}
          onChange={(event) => handleAppPathChange(event.target.value)}
          className="field field-mono flex-1"
          placeholder="/Applications/App.app"
        />
        <button type="button" onClick={chooseApp} className="btn">
          <FolderOpen size={13} />
          Choose...
        </button>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit}>
        <Plus size={13} />
        Install Launcher
      </button>
    </form>
  );
}
