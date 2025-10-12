import { z } from "zod";

export const HappyHourSchema = z.object({
  id: z.string().uuid().optional(),
  venue_id: z.number().int().nonnegative(), // BIGINT -> number
  title: z.string().min(1).max(80).optional(), // Optional, can be generated from venue
  details: z.string().max(500).optional(),
  price_cents: z.number().int().nonnegative().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/), // "16:00"
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  days: z.array(z.number().int().min(0).max(6)).min(1), // 0..6 (Sun..Sat)
  active_from: z.string().optional(),
  active_to: z.string().optional(),
  is_active: z.boolean().default(true),
  website_url: z.string().url().optional(),
});

export type HappyHour = z.infer<typeof HappyHourSchema>;
