import { z } from "zod";

// Base schema with common fields
const BaseSubmissionSchema = z.object({
  type: z.enum(["daily-deal", "lunch-special", "happy-hour"]),
  venue_name: z.string().trim().min(1, "Venue name is required"),
  venue_suburb: z.string().trim().optional(),
  website_url: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(240, "Notes must be less than 240 characters").optional().or(z.literal("")),
  submitter_email: z.string().trim().email("Valid email is required"),
});

// Helper function to parse price to cents
const parsePriceToCents = (price?: string | number): number | null => {
  if (!price) return null;
  
  // Handle number input
  if (typeof price === "number") {
    if (isNaN(price) || price < 0) return null;
    return Math.round(price * 100);
  }
  
  // Handle string input
  if (typeof price === "string") {
    if (price.trim() === "") return null;
    const cleaned = price.replace(/[$\s]/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num * 100);
  }
  
  return null;
};

// Time validation helper
const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional().or(z.literal(""));

// Base object schemas (no .refine / .superRefine)
const DailyDealBase = BaseSubmissionSchema.extend({
  type: z.literal("daily-deal"),
  title: z.string().trim().min(1, "Title is required"),
  price: z.union([z.string().trim(), z.number()]).optional().transform((val) => parsePriceToCents(val)),
  days: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  start_time: timeSchema,
  end_time: timeSchema,
});

const LunchSpecialBase = BaseSubmissionSchema.extend({
  type: z.literal("lunch-special"),
  banner_title: z.string().trim().min(1, "Banner title is required").default("$15 Lunch Menu"),
  price_from: z.union([z.string().trim(), z.number()]).optional().transform((val) => parsePriceToCents(val)),
  weekdays: z.boolean().default(true),
  days: z.array(z.number().min(0).max(6)).min(0).max(6),
  start_time: timeSchema,
  end_time: timeSchema,
  tagline: z.string().trim().max(100, "Tagline must be less than 100 characters").optional().or(z.literal("")),
});

const HappyHourBase = BaseSubmissionSchema.extend({
  type: z.literal("happy-hour"),
  days: z.array(z.number().min(0).max(6)).min(1, "At least one day must be selected"),
  start_time: timeSchema,
  end_time: timeSchema,
  offer_summary: z.string().trim().min(3, "Offer summary is required (minimum 3 characters)"),
});

// Build the union over the base objects only
const SubmissionSchemaBase = z.discriminatedUnion("type", [
  DailyDealBase,
  LunchSpecialBase,
  HappyHourBase,
]);

// Add union-level superRefine for extra rules
export const SubmissionSchema = SubmissionSchemaBase.superRefine((data, ctx) => {
  // Helper function for time ordering validation
  const checkTime = (s?: string, e?: string) =>
    s && e && s >= e ? "End time must be after start time" : null;

  if (data.type === "daily-deal") {
    // Validate time ordering
    const err = checkTime(data.start_time, data.end_time);
    if (err) ctx.addIssue({ code: "custom", path: ["end_time"], message: err });
  }

  if (data.type === "happy-hour") {
    // Validate time ordering
    const err = checkTime(data.start_time, data.end_time);
    if (err) ctx.addIssue({ code: "custom", path: ["end_time"], message: err });
  }

  if (data.type === "lunch-special") {
    // Validate weekdays OR specific days
    if (!data.weekdays && (!Array.isArray(data.days) || data.days.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message: "Select Weekdays or choose at least one day",
      });
    }
    
    // Validate time ordering
    const err = checkTime(data.start_time, data.end_time);
    if (err) ctx.addIssue({ code: "custom", path: ["end_time"], message: err });
  }
});

export type SubmissionInput = z.infer<typeof SubmissionSchema>;
export type DailyDealInput = z.infer<typeof DailyDealBase>;
export type LunchSpecialInput = z.infer<typeof LunchSpecialBase>;
export type HappyHourInput = z.infer<typeof HappyHourBase>;

// Export the individual bases for use elsewhere
export { DailyDealBase as DailyDealSchema, LunchSpecialBase as LunchSpecialSchema, HappyHourBase as HappyHourSchema };
