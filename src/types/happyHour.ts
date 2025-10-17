import { z } from "zod";

// Helper to convert day strings to Mon-first numeric indices
const DAY_TO_IDX_MON_FIRST: Record<string, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
};

export const HappyHourSchema = z.object({
  id: z.string().uuid().optional(),
  venue_id: z.number().int().nonnegative(), // BIGINT -> number
  title: z.string().min(1).max(80).optional(), // Optional, can be generated from venue
  details: z.string().max(500).optional(),
  price_cents: z.number().int().nonnegative().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/), // "16:00"
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  days: z.array(z.union([z.number().int().min(0).max(6), z.string()])).min(1).transform((arr) =>
    arr.map((v) => {
      if (typeof v === "number") return v; // assume Mon-first 0..6 from UI
      const key = v.toLowerCase();
      return DAY_TO_IDX_MON_FIRST[key] ?? 0;
    })
  ), // Accepts both numbers (0..6) and strings ("mon".."sun"), normalizes to numbers (Mon-first)
  active_from: z.string().optional(),
  active_to: z.string().optional(),
  is_active: z.boolean().default(true),
  website_url: z.string().url().optional(),
});

export type HappyHour = z.infer<typeof HappyHourSchema>;
