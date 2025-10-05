import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = Math.random().toString(36).substr(2, 8);
  const requestStartTime = Date.now();

  console.log(`\n🔍 [API:puzzle-by-id:${requestId}] === REQUEST START ===`);
  console.log(`📅 [API:puzzle-by-id:${requestId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`🌐 [API:puzzle-by-id:${requestId}] Request URL: ${req.url}`);

  const { id: puzzleId } = await params;
  console.log(`🎯 [API:puzzle-by-id:${requestId}] Requested puzzle ID: ${puzzleId}`);

  if (!puzzleId) {
    console.log(`❌ [API:puzzle-by-id:${requestId}] VALIDATION ERROR: Missing puzzle ID`);
    return NextResponse.json(
      { error: "Missing puzzle ID" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseClient();
    console.log(`📡 [API:puzzle-by-id:${requestId}] Supabase client initialized`);

    const queryStartTime = Date.now();
    console.log(`⏱️ [API:puzzle-by-id:${requestId}] Calling get_puzzle_by_id RPC...`);

    const { data, error } = await sb.rpc("get_puzzle_by_id", { _id: puzzleId });

    const queryElapsed = Date.now() - queryStartTime;
    console.log(`📊 [API:puzzle-by-id:${requestId}] RPC completed in ${queryElapsed}ms`);

    if (error) {
      console.error(`❌ [API:puzzle-by-id:${requestId}] Supabase RPC ERROR:`, error);
      console.error(`💥 [API:puzzle-by-id:${requestId}] Error details:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzle = data?.[0] ?? null;

    if (!puzzle) {
      console.log(`⚠️ [API:puzzle-by-id:${requestId}] Puzzle NOT FOUND: ${puzzleId}`);
      const totalRequestTime = Date.now() - requestStartTime;
      console.log(`⏱️ [API:puzzle-by-id:${requestId}] Total request time: ${totalRequestTime}ms (DB: ${queryElapsed}ms)`);
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const totalRequestTime = Date.now() - requestStartTime;
    console.log(`✅ [API:puzzle-by-id:${requestId}] Puzzle found successfully!`);
    console.log(`🎯 [API:puzzle-by-id:${requestId}] Puzzle details:`, {
      id: puzzle.PuzzleId,
      rating: puzzle.Rating,
      themes: puzzle.Themes,
      popularity: puzzle.Popularity,
      fenLength: puzzle.FEN?.length || 0,
      movesCount: puzzle.Moves?.length || 0
    });
    console.log(`🏁 [API:puzzle-by-id:${requestId}] === REQUEST COMPLETE ===`);
    console.log(`⏱️ [API:puzzle-by-id:${requestId}] Total request time: ${totalRequestTime}ms (DB: ${queryElapsed}ms)`);

    return NextResponse.json({ puzzle });
  } catch (err) {
    const totalRequestTime = Date.now() - requestStartTime;
    console.error(`💥 [API:puzzle-by-id:${requestId}] EXCEPTION caught:`, err);
    console.error(`🔍 [API:puzzle-by-id:${requestId}] Exception details:`, {
      type: err instanceof Error ? err.constructor.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
    console.log(`⏱️ [API:puzzle-by-id:${requestId}] Failed after ${totalRequestTime}ms`);

    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
