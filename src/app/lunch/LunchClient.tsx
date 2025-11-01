'use client';
import { useMemo, useState, useEffect } from 'react';
import DayTabs, { Sel, todayIndex } from '@/components/ui/DayTabs';
import Section from '@/components/ui/Section';
import DealCard from '@/components/ui/DealCard';
import { renderTimeRange } from '@/lib/time';
import { observeImpressions } from '@/lib/client/impression';
import { logEvent } from '@/lib/analytics';

const hhmm = (t?: string | null) => (t ? t.slice(0,5) : '');
const timeRange = (s?: string|null, e?: string|null) => {
  const a = hhmm(s), b = hhmm(e);
  return a && b ? `${a} — ${b}` : (a || b || null);
};

type Item = {
  id: string;
  venue_id?: number | null;
  title: string;
  description: string | null;
  price: number | null;
  days_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
  venueName: string | null;
  addressLine: string | null;
  venueWebsite?: string | null;
};

export default function LunchClient({ items }: { items: Item[] }) {
  const [sel, setSel] = useState<Sel>({ type: 'today' });
  const activeDay = sel.type === 'today' ? todayIndex() : sel.day;

  const filtered = useMemo(() =>
    (items ?? []).filter(it => !it.days_of_week?.length || it.days_of_week.includes(activeDay))
                 .sort((a,b) => {
                   const pa = Number(a.price ?? 0), pb = Number(b.price ?? 0);
                   return pa !== pb ? pa - pb : a.title.localeCompare(b.title);
                 })
  , [items, activeDay]);

  // Track impressions when cards come into view
  useEffect(() => {
    if (filtered.length > 0) {
      observeImpressions('[data-id]', (id) => {
        logEvent({
          type: "impression",
          category: "engagement",
          action: "impression",
          label: "lunch_card",
          entity_type: "lunch",
          entity_id: id
        });
      });
    }
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <DayTabs sel={sel} onChange={setSel} />
      <Section title="Lunch" accent="Specials">
        {filtered.length === 0 ? (
          <div className="text-neutral-600">No lunch specials for this day yet.</div>
        ) : (
          <ul className="grid gap-4">
            {filtered.map(d => {
              const badgeText =
                typeof d.price === 'number'
                  ? `$${d.price.toFixed(2)}`
                  : renderTimeRange(d.start_time, d.end_time) || undefined;

              return (
                <DealCard
                  key={d.id}
                  id={d.id}
                  venueName={d.venueName}
                  addressLine={d.addressLine}
                  venueId={d.venue_id}
                  dealTitle={d.title}
                  notes={d.description}
                  badgeText={badgeText}
                  context="lunch"
                  venueWebsite={d.venueWebsite}
                />
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}