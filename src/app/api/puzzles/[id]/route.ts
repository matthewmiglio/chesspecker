import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: puzzleId } = await params;

  if (!puzzleId) {
    return NextResponse.json(
      { error: "Missing puzzle ID" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.rpc("get_puzzle_by_id", { _id: puzzleId });

    if (error) {
      console.error(`Supabase RPC ERROR:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzle = data?.[0] ?? null;

    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    return NextResponse.json({ puzzle });
  } catch (err) {
    console.error(`Exception in get puzzle by id:`, err);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
