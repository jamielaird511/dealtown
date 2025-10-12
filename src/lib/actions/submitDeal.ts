"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmitDealInput {
  venue_name: string;
  venue_suburb?: string;
  title: string;
  description?: string;
  price?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  contact?: string;
}

export interface SubmitDealResult {
  success: boolean;
  error?: string;
  submissionId?: number;
}

/**
 * Parse price string (e.g., "6", "6.50", "$12.99") to cents
 */
function parsePriceToCents(price?: string): number | null {
  if (!price || price.trim() === "") return null;

  // Remove $ and whitespace
  const cleaned = price.replace(/[$\s]/g, "");
  const num = parseFloat(cleaned);

  if (isNaN(num) || num < 0) return null;

  return Math.round(num * 100);
}

export async function submitDeal(input: SubmitDealInput): Promise<SubmitDealResult> {
  try {
    // Validate required fields
    if (!input.venue_name?.trim()) {
      return { success: false, error: "Venue name is required" };
    }
    if (!input.title?.trim()) {
      return { success: false, error: "Deal title is required" };
    }

    // Validate day_of_week if provided
    if (input.day_of_week !== undefined && (input.day_of_week < 0 || input.day_of_week > 6)) {
      return { success: false, error: "Invalid day of week" };
    }

    // Parse price
    const price_cents = parsePriceToCents(input.price);

    const supabase = createClient();

    // Insert submission
    const { data, error } = await supabase
      .from("deal_submissions")
      .insert({
        venue_name: input.venue_name.trim(),
        venue_suburb: input.venue_suburb?.trim() || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        price_cents,
        day_of_week: input.day_of_week ?? null,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
        contact: input.contact?.trim() || null,
        source: "user",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting submission:", error);
      return { success: false, error: "Failed to submit deal. Please try again." };
    }

    // Revalidate admin submissions page
    revalidatePath("/admin/submissions");

    return { success: true, submissionId: data.id };
  } catch (error) {
    console.error("Unexpected error in submitDeal:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
