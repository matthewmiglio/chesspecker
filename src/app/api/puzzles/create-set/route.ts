import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { puzzleCreationLimiter, getClientIdentifier } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  console.log('[API GET /puzzles/create-set] Request received');

  // Rate limiting: 10 requests per hour per IP
  if (puzzleCreationLimiter) {
    const identifier = getClientIdentifier(req);
    const { success, limit, remaining, reset } = await puzzleCreationLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  const { searchParams } = new URL(req.url);
  const targetParam = searchParams.get("target");
  const sizeParam = searchParams.get("size");
  const marginParam = searchParams.get("margin") || "100";
  const tailsPctParam = searchParams.get("tails_pct") || "0.10";

  console.log('[API GET /puzzles/create-set] Query params:', {
    target: targetParam,
    size: sizeParam,
    margin: marginParam,
    tails_pct: tailsPctParam
  });

  const target = Number(targetParam);
  const size = Number(sizeParam);
  const margin = Number(marginParam);
  const tailsPct = Number(tailsPctParam);

  console.log('[API GET /puzzles/create-set] Parsed params:', { target, size, margin, tailsPct });

  if (!Number.isFinite(target) || !Number.isFinite(size)) {
    console.error('[API GET /puzzles/create-set] Invalid params:', { target, size });
    return NextResponse.json(
      { error: "target and size query params required and must be numbers" },
      { status: 400 }
    );
  }

  if (size <= 0 || size > 500) {
    console.error('[API GET /puzzles/create-set] Invalid size:', size);
    return NextResponse.json(
      { error: "size must be between 1 and 500" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseClient();
    console.log('[API GET /puzzles/create-set] Supabase client obtained');

    const t0 = Date.now();
    console.log('[API GET /puzzles/create-set] Calling create_puzzle_set RPC with params:', {
      _target: target,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct
    });

    const { data, error } = await sb.rpc("create_puzzle_set", {
      _target: target,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct
    });

    const elapsed = Date.now() - t0;
    console.log('[API GET /puzzles/create-set] RPC completed in', elapsed, 'ms');

    if (error) {
      console.error('[API GET /puzzles/create-set] Supabase RPC error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzles = data || [];
    console.log('[API GET /puzzles/create-set] Successfully retrieved', puzzles.length, 'puzzles');

    return NextResponse.json({
      target,
      size,
      margin,
      tailsPct,
      ms: elapsed,
      puzzles,
    });
  } catch (err) {
    console.error('[API GET /puzzles/create-set] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to create puzzle set" },
      { status: 500 }
    );
  }
}
