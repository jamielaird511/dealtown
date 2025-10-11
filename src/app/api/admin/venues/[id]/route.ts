import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const form = await req.formData();
  const methodOverride = form.get("_method");
  
  if (methodOverride !== "delete") {
    return NextResponse.json({ ok: true });
  }
  
  const id = Number(params.id);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("venues").delete().eq("id", id);
  
  if (error) {
    console.error("Delete venue error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  return NextResponse.redirect(new URL("/admin/venues", req.url), { status: 303 });
}
