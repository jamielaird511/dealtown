-- Migration: Add deal kinds (fixed, percent_off, amount_off, bogo)
-- Backward compatible: existing deals default to kind='fixed'

-- 1) Deal kind
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS kind TEXT
    CHECK (kind IN ('fixed', 'percent_off', 'amount_off', 'bogo'))
    DEFAULT 'fixed' NOT NULL;

-- 2) Optional fields used by non-fixed kinds
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS percent_off INT,            -- 1..100
  ADD COLUMN IF NOT EXISTS amount_off_cents INT,       -- >=0
  ADD COLUMN IF NOT EXISTS buy_qty INT,                -- for BOGO
  ADD COLUMN IF NOT EXISTS get_qty INT;                -- for BOGO

-- 3) Validate columns per kind (soft constraints via a CHECK that tolerates NULLs)
ALTER TABLE public.deals
  ADD CONSTRAINT deals_kind_shape CHECK (
    CASE kind
      WHEN 'fixed'        THEN percent_off IS NULL AND amount_off_cents IS NULL AND buy_qty IS NULL AND get_qty IS NULL
      WHEN 'percent_off'  THEN percent_off BETWEEN 1 AND 100
      WHEN 'amount_off'   THEN amount_off_cents IS NOT NULL AND amount_off_cents >= 0
      WHEN 'bogo'         THEN buy_qty IS NOT NULL AND buy_qty > 0 AND get_qty IS NOT NULL AND get_qty > 0
      ELSE false
    END
  );

-- 4) Effective price (helps sort and display; NULL if not computable)
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS effective_price_cents INT
  GENERATED ALWAYS AS (
    CASE kind
      WHEN 'fixed' THEN price_cents
      WHEN 'percent_off' THEN
        CASE WHEN price_cents IS NOT NULL AND percent_off BETWEEN 1 AND 100
             THEN (price_cents * (100 - percent_off)) / 100
             ELSE NULL END
      WHEN 'amount_off' THEN
        CASE WHEN price_cents IS NOT NULL AND amount_off_cents IS NOT NULL
             THEN GREATEST(price_cents - amount_off_cents, 0)
             ELSE NULL END
      WHEN 'bogo' THEN
        -- simplest common case: buy 1 get 1
        CASE WHEN price_cents IS NOT NULL AND buy_qty = 1 AND get_qty = 1
             THEN price_cents / 2
             ELSE NULL END
    END
  ) STORED;

-- Optional: quick label for cards/lists
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS label TEXT
  GENERATED ALWAYS AS (
    CASE kind
      WHEN 'fixed'       THEN NULL
      WHEN 'percent_off' THEN percent_off::TEXT || '% OFF'
      WHEN 'amount_off'  THEN '−$' || (amount_off_cents::NUMERIC/100)::TEXT
      WHEN 'bogo'        THEN buy_qty::TEXT || '-for-' || (buy_qty + get_qty)::TEXT
    END
  ) STORED;

-- Create index on effective_price_cents for sorting
CREATE INDEX IF NOT EXISTS idx_deals_effective_price ON deals(effective_price_cents) WHERE is_active = true;

