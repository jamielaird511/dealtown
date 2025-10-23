'use client';
import { useMemo, useState } from 'react';
import DayTabs, { Sel, todayIndex } from '@/components/ui/DayTabs';
import Section from '@/components/ui/Section';
import DealCard from '@/components/ui/DealCard';
import { renderTimeRange } from '@/lib/time';

type Item = {
  id: string;
  venue_id?: number | null;
  days_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  venueName: string | null;
  addressLine: string | null;
  venueWebsite?: string | null;
};

export default function HappyHourClient({ items }: { items: Item[] }) {
  const [sel, setSel] = useState<Sel>({ type: 'today' });
  const activeDay = sel.type === 'today' ? todayIndex() : sel.day;

  const filtered = useMemo(() => {
    return (items ?? [])
      .filter(
        (it) => !it.days_of_week?.length || it.days_of_week.includes(activeDay)
      )
      .sort((a, b) => {
        // sort by start time then by venue name
        const ta = a.start_time ?? "";
        const tb = b.start_time ?? "";
        if (ta !== tb) return ta.localeCompare(tb);
        return (a.venueName ?? "").localeCompare(b.venueName ?? "");
      });
  }, [items, activeDay]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <DayTabs sel={sel} onChange={setSel} />
      <Section title="Happy" accent="Hour">
        {filtered.length === 0 ? (
          <div className="text-neutral-600">No happy hours for this day yet.</div>
        ) : (
          <ul className="grid gap-4">
            {filtered.map((hh) => (
              <DealCard
                key={hh.id}
                venueName={hh.venueName}
                addressLine={hh.addressLine}
                venueId={hh.venue_id}
                dealTitle={null}                // ← use null instead of undefined
                notes={hh.notes}
                badgeText={renderTimeRange(hh.start_time, hh.end_time) || undefined}
                context="happy_hour"
                venueWebsite={hh.venueWebsite}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

