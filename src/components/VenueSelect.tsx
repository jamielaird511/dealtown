'use client';

import * as React from 'react';
import { fetchAllActiveVenues, type Venue } from '@/lib/db';

type Props = {
  value?: number | string | null;
  onChange: (venueId: number | string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** If true, include address hint below the field */
  showAddressHint?: boolean;
  name?: string; // optional form field name
};

export default function VenueSelect({
  value,
  onChange,
  placeholder = 'Select a venue…',
  disabled,
  showAddressHint = false,
  name,
}: Props) {
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const v = await fetchAllActiveVenues();
      if (mounted) {
        setVenues(v);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Venue</label>
      <select
        className="w-full rounded border px-3 py-2"
        value={value == null ? '' : String(value)}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        name={name}
      >
        <option value="">{loading ? 'Loading…' : placeholder}</option>
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      {showAddressHint && value != null && value !== '' && (
        <p className="text-xs text-neutral-500">
          {venues.find((v) => String(v.id) === String(value))?.address ?? ''}
        </p>
      )}
    </div>
  );
}


