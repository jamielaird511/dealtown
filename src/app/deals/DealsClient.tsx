'use client';
import { useMemo, useState } from 'react';
import DayTabs, { Sel, todayIndex } from '@/components/ui/DayTabs';
import Section from '@/components/ui/Section';
import DealCard from '@/components/ui/DealCard';

type Item = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  days_of_week: number[] | null;
  venueName: string | null;
  addressLine: string | null;
};

export default function DealsClient({ items }: { items: Item[] }) {
  const [sel, setSel] = useState<Sel>({ type: 'today' });
  const activeDay = sel.type === 'today' ? todayIndex() : sel.day;

  const filtered = useMemo(
    () =>
      (items ?? [])
        .filter(it => !it.days_of_week?.length || it.days_of_week.includes(activeDay))
        .sort((a, b) => {
          const pa = a.price ?? Number.POSITIVE_INFINITY;
          const pb = b.price ?? Number.POSITIVE_INFINITY;
          if (pa !== pb) return pa - pb;
          return (a.venueName ?? '').localeCompare(b.venueName ?? '');
        }),
    [items, activeDay]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-base text-neutral-900 leading-normal">
      <DayTabs sel={sel} onChange={setSel} />
      <Section title="Today's" accent="Deals">
        {filtered.length === 0 ? (
          <div className="text-neutral-600">No deals for this day yet.</div>
        ) : (
          <ul className="grid gap-4">
            {filtered.map(d => (
              <DealCard
                key={d.id}
                venueName={d.venueName}
                addressLine={d.addressLine}
                dealTitle={d.title}                 // deal name (e.g., "Taco Tuesday")
                notes={d.description}               // notes / details
                badgeText={d.price != null ? `$${d.price.toFixed(2)}` : undefined}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

