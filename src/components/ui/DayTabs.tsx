'use client';
import React from 'react';

export type Sel = { type: 'today' } | { type: 'day'; day: number };

const DAY_LABELS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

export function todayIndex() { return new Date().getDay(); }

export default function DayTabs({
  sel, onChange
}: {
  sel: Sel;
  onChange: (s: Sel) => void;
}) {
  const pillBase = 'rounded-full px-4 py-2 text-sm border transition';
  const pillActive = 'bg-orange-500 text-white border-orange-500 shadow-sm';
  const pillInactive = 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50';

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-3 flex flex-wrap items-center gap-2">
      <span className="px-3 py-1 text-sm text-neutral-600">Day</span>

      <button
        onClick={() => onChange({ type: 'today' })}
        className={[pillBase, sel.type === 'today' ? pillActive : pillInactive].join(' ')}
        aria-pressed={sel.type === 'today'}
      >
        TODAY
      </button>

      {DAY_LABELS.map((l, i) => (
        <button
          key={l}
          onClick={() => onChange({ type: 'day', day: i })}
          className={[pillBase, sel.type === 'day' && sel.day === i ? pillActive : pillInactive].join(' ')}
          aria-pressed={sel.type === 'day' && sel.day === i}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

