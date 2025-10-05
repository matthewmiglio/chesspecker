import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ratingParam = searchParams.get("rating");
  const stratParam = (searchParams.get("strat") || "offset").toLowerCase();

  const rating = Number(ratingParam);
  if (!Number.isFinite(rating)) {
    return NextResponse.json(
      { error: "rating query param required" },
      { status: 400 }
    );
  }

  const rpc =
    stratParam === "idwrap"
      ? "get_random_puzzle_under_rating_idwrap"
      : "get_random_puzzle_under_rating";

  try {
    const sb = getSupabaseClient();
    const t0 = Date.now();
    const { data, error } = await sb.rpc(rpc, { _rating: rating });
    const elapsed = Date.now() - t0;

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      strat: stratParam,
      ms: elapsed,
      puzzle: data?.[0] ?? null,
    });
  } catch (err) {
    console.error("Failed to fetch random puzzle:", err);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
