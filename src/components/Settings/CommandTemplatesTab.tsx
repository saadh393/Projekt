import { useEffect, useState, type FormEvent } from "react";
import { Check, Plus, Terminal, Trash2 } from "lucide-react";
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
          { label: template.label, command: template.command },
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
    <div className="space-y-5">
      <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
        Command Templates
      </h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-2 rounded-[10px] border p-3"
        style={{ borderColor: "var(--border-subtle)", background: "rgba(0,0,0,0.018)" }}
      >
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="field"
          placeholder="Label (e.g. Start dev)"
        />
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          className="field field-mono"
          placeholder="npm run dev"
        />
        <button type="submit" className="btn btn-primary w-full">
          <Plus size={13} />
          Add Template
        </button>
      </form>

      {data.length ? (
        <div className="space-y-1.5">
          {data.map((template) => (
            <div
              key={template.id}
              className="rounded-[10px] border bg-white p-2.5"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Terminal size={13} style={{ color: "var(--text-tertiary)" }} />
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
                  className="field flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
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
                  className="field field-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateCommandTemplate.mutate({
                      id: template.id,
                      template: drafts[template.id] ?? template,
                    })
                  }
                  className="btn-icon"
                  aria-label={`Save ${template.label}`}
                  style={{ color: "#16a34a" }}
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCommandTemplate.mutate(template.id)}
                  className="btn-icon btn-destructive"
                  aria-label={`Delete ${template.label}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
