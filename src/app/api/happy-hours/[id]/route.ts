import { NextResponse } from "next/server";
import { HappyHourSchema } from "@/types/happyHour";
import { updateHappyHour } from "@/lib/happyHours";
import { getSupabaseServerActionClient } from "@/lib/supabaseClients";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const raw = await req.json();
  const parsed = HappyHourSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { data, error } = await updateHappyHour(params.id, parsed.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerActionClient();

    // Delete and force PostgREST to return the affected row
    const { data, error } = await supabase
      .from("happy_hours")
      .delete()
      .eq("id", params.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Either not found or blocked by RLS
      return NextResponse.json(
        { error: "No row deleted (not found or not permitted)." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
