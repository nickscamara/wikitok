import { NextResponse } from "next/server";
import { generateCards } from "@/lib/wikipedia-pairs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get("count") || "5"), 20);
  const cards = generateCards(count);
  return NextResponse.json({ cards });
}
