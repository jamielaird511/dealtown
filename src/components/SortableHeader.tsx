import * as React from "react";
import type { SortDir } from "@/lib/sort";

type Props = {
  label: string;
  active: boolean;
  dir: SortDir;
  onToggle: () => void;
  title?: string;
};

export default function SortableHeader({ label, active, dir, onToggle, title }: Props) {
  return (
    <button
      type="button"
      title={title ?? `Sort by ${label}`}
      className={[
        "inline-flex items-center gap-1 select-none",
        "text-left font-semibold",
        "hover:underline",
      ].join(" ")}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="text-xs" aria-hidden="true">
        {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </button>
  );
}
