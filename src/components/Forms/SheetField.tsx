import type { ReactNode } from "react";

type SheetFieldProps = {
  label: string;
  children: ReactNode;
};

export function SheetField({ label, children }: SheetFieldProps) {
  return (
    <div className="space-y-1.5">
      <span
        className="block text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
