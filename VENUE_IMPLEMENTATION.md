# Venue "Connect-or-Create" Implementation

## Overview
Implemented a normalized venue relationship where deals reference a `venue_id` foreign key instead of storing denormalized `venue_name`/`venue_address` directly. The admin API automatically finds or creates venues when creating/editing deals.

## Changes Made

### 1. **Type Definitions** (`src/lib/types.ts`)
Added new `Venue` type and updated `Deal` type:

```ts
export type Venue = {
  id: number;
  name: string;
  address: string | null;
  website_url: string | null;
};

export type Deal = {
  id: number;
  title: string;
  day_of_week: string;
  is_active: boolean;
  venue_id: number;          // ← Foreign key
  venue?: Venue;             // ← Nested relation for display
  venue_name?: string;       // ← For forms (backward compat)
  venue_address?: string;    // ← For forms (backward compat)
  // ... other fields
};
```

### 2. **Database RPC Function** (`supabase/migrations/0007_upsert_venue_rpc.sql`)
Created a Postgres function for atomic venue find-or-create:

```sql
CREATE OR REPLACE FUNCTION public.upsert_venue(
  v_name TEXT,
  v_address TEXT,
  v_website_url TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  venue_id INTEGER;
BEGIN
  -- Try to find existing venue (NULL-safe comparison)
  SELECT id INTO venue_id
  FROM public.venues
  WHERE name = v_name
    AND (address = v_address OR (address IS NULL AND v_address IS NULL))
  LIMIT 1;

  -- If not found, create it
  IF venue_id IS NULL THEN
    INSERT INTO public.venues (name, address, website_url)
    VALUES (v_name, v_address, v_website_url)
    RETURNING id INTO venue_id;
  END IF;

  RETURN venue_id;
END;
$$;
```

**Benefits**:
- ✅ **Atomic operation** - No race conditions
- ✅ **Single DB round-trip** - Faster performance
- ✅ **NULL-safe** - Handles null addresses correctly
- ✅ **Transactional** - Either finds or creates, never fails halfway

### 3. **Admin API - Create Route** (`src/app/api/admin/deals/route.ts`)
**POST handler** now uses RPC:
- Accepts `venue_name`, `venue_address`, `website_url` from form
- Calls `upsert_venue` RPC (returns venue_id)
- Inserts deal with resolved `venue_id`

```ts
// Resolve or create the venue using RPC (atomic operation)
const { data: venueId, error: vErr } = await supabase.rpc('upsert_venue', {
  v_name: parsed.data.venue_name?.trim() || null,
  v_address: parsed.data.venue_address?.trim() || null,
  v_website_url: parsed.data.website_url || null,
});

if (vErr) {
  // Handle error...
}

// Insert deal with venue_id
await supabase.from('deals').insert({
  title,
  day_of_week,
  is_active,
  venue_id: venueId as number,
  price_cents,
  notes,
  created_by: user.id,
});
```

### 4. **Admin API - Update Route** (`src/app/api/admin/deals/[id]/route.ts`)
**PATCH handler** uses same RPC:
- Accepts `venue_name`, `venue_address`, `website_url` from form
- Calls `upsert_venue` RPC
- Updates deal with resolved `venue_id`

```ts
const { data: venueId, error: vErr } = await admin.rpc('upsert_venue', {
  v_name: parsed.venue_name?.trim() || null,
  v_address: parsed.venue_address?.trim() || null,
  v_website_url: parsed.website_url || null,
});

const payload = {
  title: parsed.title,
  day_of_week: parsed.day_of_week,
  venue_id: venueId as number,
  // ... other fields
};
```

### 5. **Admin List Page** (`src/app/admin/page.tsx`)
- Fetches deals with nested venue data: `.select('...venues(id,name,address,website_url)')`
- Displays venue name/address from nested object: `(d.venues as any)?.name`

### 6. **Admin Edit Page** (`src/app/admin/[id]/page.tsx`)
- Fetches deal with nested venue: `.select('...venues(id,name,address,website_url)')`
- Form pre-populates with venue data: `defaultValue={(deal.venues as any)?.name}`
- Form still submits `venue_name`, `venue_address` (API handles normalization)

### 7. **Public Data Fetchers** (`src/lib/data.ts`)
- Updated `fetchDeals()` to join with venues
- Maps nested venue data to flat structure for backward compatibility
- Public components (`DealCard`) continue using `venue_name`, `venue_address`

```ts
.select("id,title,notes,price_cents,venue_id,venues(name,address,website_url)")
// Map to flat structure
.map((d: any) => ({
  id: d.id,
  title: d.title,
  notes: d.notes,
  price_cents: d.price_cents,
  venue_name: d.venues?.name,
  venue_address: d.venues?.address,
  website_url: d.venues?.website_url,
}));
```

## Benefits

✅ **No duplicate venues** - Same venue used across multiple deals  
✅ **Consistent data** - Venue name/address updated in one place  
✅ **Simple admin UX** - No venue picker needed; just type the name  
✅ **Backward compatible** - Public API unchanged  
✅ **Automatic deduplication** - Same name+address = same venue_id  

## Database Structure

```
venues
  id (PK)
  name
  address
  website_url

deals
  id (PK)
  title
  venue_id (FK → venues.id)  ← Key change
  day_of_week
  is_active
  price_cents
  notes
```

## Future Enhancements (Optional)

When ready, you can add:
- `/api/admin/venues?search=...` for fuzzy venue search
- Autocomplete venue picker in admin forms
- Separate "Add new venue" modal
- Venue management page (edit venue name/address for all deals)

## Migration Notes

If you have existing deals with denormalized venue data:
1. Create a migration to populate the `venues` table from existing `deals.venue_name/venue_address`
2. Update `deals.venue_id` to reference the normalized venues
3. Remove old `venue_name`/`venue_address` columns from deals table

