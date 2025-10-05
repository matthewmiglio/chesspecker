import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Puzzle = {
  PuzzleId: string;
  Rating: number;
};

export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 8);
  const requestStartTime = Date.now();

  console.log(`\n🎲 [API:create-set:${requestId}] === REQUEST START ===`);
  console.log(`📅 [API:create-set:${requestId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`🌐 [API:create-set:${requestId}] Request URL: ${req.url}`);

  const { searchParams } = new URL(req.url);
  const targetParam = searchParams.get("target");
  const sizeParam = searchParams.get("size");
  const marginParam = searchParams.get("margin") || "100";
  const tailsPctParam = searchParams.get("tails_pct") || "0.10";

  console.log(`📦 [API:create-set:${requestId}] Request params:`, {
    targetParam,
    sizeParam,
    marginParam,
    tailsPctParam
  });

  const target = Number(targetParam);
  const size = Number(sizeParam);
  const margin = Number(marginParam);
  const tailsPct = Number(tailsPctParam);

  if (!Number.isFinite(target) || !Number.isFinite(size)) {
    console.log(`❌ [API:create-set:${requestId}] VALIDATION ERROR: Invalid params`);
    return NextResponse.json(
      { error: "target and size query params required and must be numbers" },
      { status: 400 }
    );
  }

  if (size <= 0 || size > 500) {
    console.log(`❌ [API:create-set:${requestId}] VALIDATION ERROR: size must be 1-500`);
    return NextResponse.json(
      { error: "size must be between 1 and 500" },
      { status: 400 }
    );
  }

  console.log(`🔧 [API:create-set:${requestId}] Using RPC function: create_puzzle_set`);
  console.log(`🎯 [API:create-set:${requestId}] Creating set: target=${target}, size=${size}, margin=${margin}, tails=${tailsPct}`);

  try {
    const sb = getSupabaseClient();
    console.log(`📡 [API:create-set:${requestId}] Supabase client initialized`);

    const t0 = Date.now();
    console.log(`⏱️ [API:create-set:${requestId}] Executing RPC call...`);

    const { data, error } = await sb.rpc("create_puzzle_set", {
      _target: target,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct
    });

    const elapsed = Date.now() - t0;
    console.log(`📊 [API:create-set:${requestId}] RPC call completed in ${elapsed}ms`);

    if (error) {
      console.error(`❌ [API:create-set:${requestId}] Supabase RPC ERROR:`, error);
      console.error(`💥 [API:create-set:${requestId}] Error details:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzles = data || [];
    const totalRequestTime = Date.now() - requestStartTime;

    if (puzzles.length > 0) {
      const avgRating = puzzles.reduce((sum: number, p: Puzzle) => sum + p.Rating, 0) / puzzles.length;
      console.log(`✅ [API:create-set:${requestId}] Puzzle set created successfully!`);
      console.log(`🎯 [API:create-set:${requestId}] Set details:`, {
        requested: size,
        received: puzzles.length,
        avgRating: avgRating.toFixed(0),
        target: target,
        first5Ids: puzzles.slice(0, 5).map((p: Puzzle) => p.PuzzleId)
      });
    } else {
      console.log(`⚠️ [API:create-set:${requestId}] No puzzles returned for target=${target}, size=${size}`);
    }

    console.log(`🏁 [API:create-set:${requestId}] === REQUEST COMPLETE ===`);
    console.log(`⏱️ [API:create-set:${requestId}] Total request time: ${totalRequestTime}ms (DB: ${elapsed}ms)`);

    return NextResponse.json({
      target,
      size,
      margin,
      tailsPct,
      ms: elapsed,
      puzzles,
    });
  } catch (err) {
    const totalRequestTime = Date.now() - requestStartTime;
    console.error(`💥 [API:create-set:${requestId}] EXCEPTION caught:`, err);
    console.error(`🔍 [API:create-set:${requestId}] Exception details:`, {
      type: err instanceof Error ? err.constructor.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
    console.log(`⏱️ [API:create-set:${requestId}] Failed after ${totalRequestTime}ms`);

    return NextResponse.json(
      { error: "Failed to create puzzle set" },
      { status: 500 }
    );
  }
}
