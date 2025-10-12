# Supabase Join Fix: Explicit Foreign Key Constraints

## Problem

Empty results when querying with nested relations, even when data exists in the database.

## Root Cause

Supabase couldn't determine which foreign key to use when joining tables. Without explicit constraint names, the query would fail silently or return empty results.

## Solution

Use **explicit foreign key constraint names** in `.select()` queries:

### ❌ Before (Ambiguous)

```ts
.select('id, title, venues(name, address)')
```

### ✅ After (Explicit)

```ts
.select(`
  id, title,
  venues:venues!deals_venue_id_fkey (
    name, address
  )
`)
```

## Syntax Breakdown

```ts
venues:venues!deals_venue_id_fkey (columns)
│      │      └─────────────────── Foreign key constraint name
│      └────────────────────────── Table name
└───────────────────────────────── Alias for the relation
```

### How to Find Constraint Names

**Option 1: Supabase Dashboard**

- Go to Table Editor → `deals` table → Foreign Keys
- Look for the constraint name (e.g., `deals_venue_id_fkey`)

**Option 2: SQL Query**

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'deals';
```

**Option 3: Default Naming Pattern**
Postgres/Supabase uses:

```
{table_name}_{column_name}_fkey
```

Example: `deals_venue_id_fkey` for `deals.venue_id → venues.id`

## Files Updated

### 1. Admin List (`src/app/admin/page.tsx`)

```ts
const { data: deals, error: dealsError } = await supabase
  .from("deals")
  .select(
    `
    id, title, day_of_week, is_active, venue_id, price_cents, notes, created_at, updated_at,
    venues:venues!deals_venue_id_fkey (
      id, name, address, website_url
    )
  `
  )
  .order("created_at", { ascending: false })
  .limit(50);
```

### 2. Admin Edit (`src/app/admin/[id]/page.tsx`)

```ts
const { data: deal, error } = await supabase
  .from("deals")
  .select(
    `
    id, title, day_of_week, is_active, venue_id, price_cents, notes,
    venues:venues!deals_venue_id_fkey (
      id, name, address, website_url
    )
  `
  )
  .eq("id", id)
  .maybeSingle();
```

### 3. Admin API (`src/app/api/admin/deals/route.ts`)

```ts
let query = supabase
  .from("deals")
  .select(
    `
    *,
    venues:venues!deals_venue_id_fkey (*)
  `,
    { count: "exact" }
  )
  .order("created_at", { ascending: false });
```

### 4. Public Data Fetchers (`src/lib/data.ts`)

```ts
// Both today and weekday paths
.select(`
  id, title, notes, price_cents, venue_id,
  venues:venues!deals_venue_id_fkey (
    name, address, website_url
  )
`)
```

## Benefits

✅ **No silent failures** - Clear error if constraint doesn't exist  
✅ **Explicit intent** - Readable which FK is being used  
✅ **Performance** - DB knows exact join path  
✅ **Debugging** - Errors show constraint name  
✅ **Future-proof** - Won't break if multiple FKs added

## Common Patterns

### Many-to-One (deals → venues)

```ts
.select(`
  *,
  venues:venues!deals_venue_id_fkey (*)
`)
```

### One-to-Many (venues → deals)

```ts
.select(`
  *,
  deals:deals!deals_venue_id_fkey (*)
`)
```

### Multiple Relations

```ts
.select(`
  *,
  venues:venues!deals_venue_id_fkey (id, name),
  creator:users!deals_created_by_fkey (id, email)
`)
```

## Troubleshooting

### Error: "Could not find a relationship"

- Check constraint exists: `\d+ deals` in psql
- Verify spelling matches exactly
- Ensure FK was created in migration

### Empty results but no error

- Foreign key might be NULL
- Use `.is('venue_id', null)` to check
- Or use LEFT JOIN semantic (Supabase does this by default)

### Type errors in TypeScript

```ts
// Cast nested data
const venueName = (deal.venues as any)?.name;

// Or define proper types
type DealWithVenue = Deal & {
  venues: Venue | null;
};
```

## Migration Impact

If you rename a foreign key constraint, update ALL queries using it:

```sql
-- Rename constraint (if needed)
ALTER TABLE deals
  DROP CONSTRAINT deals_venue_id_fkey,
  ADD CONSTRAINT deal_venue_fk FOREIGN KEY (venue_id) REFERENCES venues(id);
```

Then update queries:

```ts
// Old: venues!deals_venue_id_fkey
// New: venues!deal_venue_fk
```

## References

- [Supabase Docs: Joins & Relations](https://supabase.com/docs/guides/database/joins-and-relations)
- [PostgREST Foreign Key Joins](https://postgrest.org/en/stable/api.html#resource-embedding)
