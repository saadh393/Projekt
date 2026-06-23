import { useEffect, useState, type FormEvent } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  useCommandTemplateActions,
  useCommandTemplates,
} from "../../hooks/useCommandTemplates";

export function CommandTemplatesTab() {
  const { data = [] } = useCommandTemplates();
  const [label, setLabel] = useState("");
  const [command, setCommand] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { label: string; command: string }>>({});
  const { createCommandTemplate, updateCommandTemplate, deleteCommandTemplate } = useCommandTemplateActions();

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        data.map((template) => [
          template.id,
          {
            label: template.label,
            command: template.command,
          },
        ]),
      ),
    );
  }, [data]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!label.trim() || !command.trim()) {
      return;
    }

    createCommandTemplate.mutate(
      { label: label.trim(), command: command.trim() },
      {
        onSuccess: () => {
          setLabel("");
          setCommand("");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="Label"
        />
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="npm run dev"
        />
        <button type="submit" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 text-sm text-white">
          <Plus size={15} />
          Add Template
        </button>
      </form>

      <div className="space-y-2">
        {data.map((template) => (
          <div
            key={template.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="grid min-w-0 flex-1 gap-2">
              <input
                value={drafts[template.id]?.label ?? template.label}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [template.id]: {
                      label: event.target.value,
                      command: current[template.id]?.command ?? template.command,
                    },
                  }))
                }
                className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
              />
              <input
                value={drafts[template.id]?.command ?? template.command}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [template.id]: {
                      label: current[template.id]?.label ?? template.label,
                      command: event.target.value,
                    },
                  }))
                }
                className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                updateCommandTemplate.mutate({
                  id: template.id,
                  template: drafts[template.id] ?? template,
                })
              }
              className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              aria-label={`Save ${template.label}`}
            >
              <Check size={15} />
            </button>
            <button
              type="button"
              onClick={() => deleteCommandTemplate.mutate(template.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label={`Delete ${template.label}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
