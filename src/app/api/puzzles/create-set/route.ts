import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Puzzle = {
  PuzzleId: string;
  Rating: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetParam = searchParams.get("target");
  const sizeParam = searchParams.get("size");
  const marginParam = searchParams.get("margin") || "100";
  const tailsPctParam = searchParams.get("tails_pct") || "0.10";

  const target = Number(targetParam);
  const size = Number(sizeParam);
  const margin = Number(marginParam);
  const tailsPct = Number(tailsPctParam);

  if (!Number.isFinite(target) || !Number.isFinite(size)) {
    return NextResponse.json(
      { error: "target and size query params required and must be numbers" },
      { status: 400 }
    );
  }

  if (size <= 0 || size > 500) {
    return NextResponse.json(
      { error: "size must be between 1 and 500" },
      { status: 400 }
    );
  }

  try {
    const sb = getSupabaseClient();
    const t0 = Date.now();

    const { data, error } = await sb.rpc("create_puzzle_set", {
      _target: target,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct
    });

    const elapsed = Date.now() - t0;

    if (error) {
      console.error(`Supabase RPC ERROR:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzles = data || [];

    return NextResponse.json({
      target,
      size,
      margin,
      tailsPct,
      ms: elapsed,
      puzzles,
    });
  } catch (err) {
    console.error(`Exception in create puzzle set:`, err);
    return NextResponse.json(
      { error: "Failed to create puzzle set" },
      { status: 500 }
    );
  }
}
