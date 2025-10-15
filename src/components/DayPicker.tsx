"use client";
import { DOW_ORDER, DOW_LABELS } from "@/lib/day";

type Props = {
  value: number[];
  onChange: (days: number[]) => void;
};

export default function DayPicker({ value, onChange }: Props) {
  const toggle = (d: number) =>
    onChange(
      value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b)
    );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {DOW_ORDER.map((dow, i) => (
          <button
            key={dow}
            type="button"
            className={`px-3 py-1 rounded-full border ${value.includes(i) ? "bg-black text-white" : ""}`}
            onClick={() => toggle(i)}
          >
            {DOW_LABELS[dow]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => onChange([1, 2, 3, 4, 5])}
        >
          Weekdays
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => onChange([0, 1, 2, 3, 4, 5, 6])}
        >
          Everyday
        </button>
        <button type="button" className="px-3 py-1 rounded border" onClick={() => onChange([])}>
          Clear
        </button>
      </div>
    </div>
  );
}
