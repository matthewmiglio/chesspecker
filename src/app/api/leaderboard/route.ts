import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  puzzles_completed: number;
  is_premium: boolean;
}

/**
 * GET /api/leaderboard
 *
 * Returns leaderboard data (public endpoint, no auth required).
 * Uses RPC function to ensure PII safety.
 *
 * Query params:
 * - limit: number of entries to return (default 100, max 500)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "100", 10) || 100, 1), 500);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    const { data, error } = await supabase.rpc("get_leaderboard", {
      p_limit: limit,
    });

    if (error) {
      console.error("[API GET /leaderboard] RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leaderboard: data || [] });
  } catch (err) {
    console.error("[API GET /leaderboard] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
