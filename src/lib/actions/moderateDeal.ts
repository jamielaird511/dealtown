"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ApproveDealResult {
  success: boolean;
  error?: string;
  dealId?: string;
}

export async function approveDeal(submissionId: number): Promise<ApproveDealResult> {
  try {
    const supabase = createClient();

    // 1. Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from("deal_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      console.error("Error fetching submission:", fetchError);
      return { success: false, error: "Submission not found" };
    }

    // Check if already approved
    if (submission.approved_at) {
      return { success: false, error: "Submission already approved" };
    }

    // 2. Find or create venue
    let venueId: string;

    // Try to find existing venue by name and city
    const { data: existingVenues } = await supabase
      .from("venues")
      .select("id")
      .ilike("name", submission.venue_name)
      .ilike("city", submission.venue_suburb || "")
      .limit(1);

    if (existingVenues && existingVenues.length > 0) {
      venueId = existingVenues[0].id;
    } else {
      // Create new venue
      const { data: newVenue, error: venueError } = await supabase
        .from("venues")
        .insert({
          name: submission.venue_name,
          address: "Address pending",
          city: submission.venue_suburb || "Unknown",
          state: "OR", // Default state
          zip_code: "00000",
          category: "Restaurant", // Default category
        })
        .select("id")
        .single();

      if (venueError || !newVenue) {
        console.error("Error creating venue:", venueError);
        return { success: false, error: "Failed to create venue" };
      }

      venueId = newVenue.id;
    }

    // 3. Create deal from submission
    const { data: newDeal, error: dealError } = await supabase
      .from("deals")
      .insert({
        venue_id: venueId,
        title: submission.title,
        description: submission.description || "",
        deal_type: "Special", // Default type
        day_of_week: submission.day_of_week,
        start_time: submission.start_time,
        end_time: submission.end_time,
        price_cents: submission.price_cents,
        is_active: true,
      })
      .select("id")
      .single();

    if (dealError || !newDeal) {
      console.error("Error creating deal:", dealError);
      return { success: false, error: "Failed to create deal" };
    }

    // 4. Mark submission as approved
    const { error: updateError } = await supabase
      .from("deal_submissions")
      .update({
        approved_at: new Date().toISOString(),
        approved_by: "admin-stub",
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Error updating submission:", updateError);
      // Deal was created but couldn't mark as approved - not critical
    }

    // Revalidate pages
    revalidatePath("/admin/submissions");
    revalidatePath("/");

    return { success: true, dealId: newDeal.id };
  } catch (error) {
    console.error("Unexpected error in approveDeal:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
