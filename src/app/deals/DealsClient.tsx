'use client';
import { useMemo, useState, useEffect } from 'react';
import DayTabs, { Sel, todayIndex } from '@/components/ui/DayTabs';
import Section from '@/components/ui/Section';
import DealCard from '@/components/ui/DealCard';
import { observeImpressions } from '@/lib/client/impression';
import { logEvent } from '@/lib/analytics';

type Item = {
  id: string;
  venue_id?: number | null;
  title: string;
  description: string | null;
  price: number | null;
  days_of_week: number[] | null;
  venueName: string | null;
  addressLine: string | null;
  venue?: { id?: number; name?: string; address?: string; website?: string; website_url?: string } | null;
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

  // Track impressions when cards come into view
  useEffect(() => {
    if (filtered.length > 0) {
      observeImpressions('[data-id]', (id) => {
        logEvent({
          type: "impression", // legacy
          category: "engagement",
          action: "impression",
          label: "deal_card",
          entity_type: "deal",
          entity_id: id
        });
      });
    }
  }, [filtered]);

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
                id={d.id}
                venueName={d.venueName}
                addressLine={d.addressLine}
                venueId={d.venue_id}
                dealTitle={d.title}                 // deal name (e.g., "Taco Tuesday")
                notes={d.description}               // notes / details
                badgeText={d.price != null ? `$${d.price.toFixed(2)}` : undefined}
                context="deal"
                venueWebsite={d.venue?.website_url ?? d.venue?.website ?? null}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

