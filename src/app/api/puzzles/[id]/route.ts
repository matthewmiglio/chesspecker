import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const puzzleId = params.id;

  if (!puzzleId) {
    return NextResponse.json(
      { error: "Missing puzzle ID" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("ChessPeckerPuzzles")
      .select("*")
      .eq("PuzzleId", puzzleId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    return NextResponse.json({ puzzle: data });
  } catch (err) {
    console.error("Failed to fetch puzzle by ID:", err);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
