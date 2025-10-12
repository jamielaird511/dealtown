import { NextResponse } from "next/server";
import { fetchVenues } from "@/lib/data";

export async function GET() {
  const venues = await fetchVenues();
  return NextResponse.json({ data: venues });
}
