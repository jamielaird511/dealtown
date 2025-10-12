import { NextResponse } from "next/server";
import { HappyHourSchema } from "@/types/happyHour";
import { updateHappyHour, deleteHappyHour } from "@/lib/happyHours";

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
  const { error } = await deleteHappyHour(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
