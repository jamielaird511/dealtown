import { NextResponse } from "next/server";
import { listHappyHoursForDay, createHappyHour } from "@/lib/happyHours";
import { HappyHourSchema } from "@/types/happyHour";
import { getDowInZone } from "@/lib/time";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get("day"); // "0".."6" | "today" | null
    const idx = day === "today" || day == null ? getDowInZone("Pacific/Auckland") : Number(day);
    const target = Number.isInteger(idx) ? (idx as number) : 0;

    const { data, error } = await listHappyHoursForDay(target);
    if (error) return NextResponse.json({ data: [], error: error.message }, { status: 200 });
    return NextResponse.json({ data: data ?? [], dayIndex: target }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e?.message ?? "unknown error" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  const raw = await req.json();

  // Remove title key if empty (don't send title: null to DB)
  if (!raw.title) delete raw.title;

  const parsed = HappyHourSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { data, error } = await createHappyHour(parsed.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
