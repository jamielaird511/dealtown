"use client";
import { ISO_WEEKDAY_LABELS_ARRAY, ISO_WEEKDAY_NUMBERS } from "@/lib/constants/weekdays";

type Props = {
  value: number[]; // ISO weekdays (1=Mon, 7=Sun)
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
        {ISO_WEEKDAY_NUMBERS.map((isoDay) => (
          <button
            key={isoDay}
            type="button"
            className={`px-3 py-1 rounded-full border ${value.includes(isoDay) ? "bg-black text-white" : ""}`}
            onClick={() => toggle(isoDay)}
          >
            {ISO_WEEKDAY_LABELS_ARRAY[isoDay - 1]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => onChange([1, 2, 3, 4, 5])} // Mon-Fri
        >
          Weekdays
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => onChange([1, 2, 3, 4, 5, 6, 7])} // All days
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
