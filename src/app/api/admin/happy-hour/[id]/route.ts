import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!params?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { error } = await supabase.from("happy_hours").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}