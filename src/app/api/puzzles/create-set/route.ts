import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { validateThemes, PUZZLE_THEMES_OVER_10K } from "@/lib/constants/puzzleThemes";

export async function GET(req: NextRequest) {
  console.log('[API GET /puzzles/create-set] Request received');

  const { searchParams } = new URL(req.url);
  const targetParam = searchParams.get("target");
  const sizeParam = searchParams.get("size");
  const marginParam = searchParams.get("margin") || "100";
  const tailsPctParam = searchParams.get("tails_pct") || "0.10";

  // Parse themes parameter - supports both comma-separated and multiple params
  const themesParam = searchParams.get("themes");
  const themesMultiple = searchParams.getAll("themes");
  let rawThemes: string[] = [];

  if (themesMultiple.length > 1) {
    // Multiple themes= parameters
    rawThemes = themesMultiple;
  } else if (themesParam) {
    // Comma-separated themes
    rawThemes = themesParam.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  console.log('[API GET /puzzles/create-set] Query params:', {
    target: targetParam,
    size: sizeParam,
    margin: marginParam,
    tails_pct: tailsPctParam,
    themes_raw: rawThemes
  });

  const target = Number(targetParam);
  const size = Number(sizeParam);
  const margin = Number(marginParam);
  const tailsPct = Number(tailsPctParam);

  // Clamp target ELO to minimum of 700 for puzzle fetching
  // (UI allows 500, but actual puzzles are always 700+)
  const clampedTarget = Math.max(700, target);

  // Validate and normalize themes
  const themes = validateThemes(rawThemes);

  // If no valid themes provided, return error with helpful message
  if (themes.length === 0) {
    const allowedThemesStr = PUZZLE_THEMES_OVER_10K.join(', ');
    console.error('[API GET /puzzles/create-set] No valid themes provided');
    return NextResponse.json(
      {
        error: `At least one valid theme is required. Allowed themes: ${allowedThemesStr}`,
        allowedThemes: PUZZLE_THEMES_OVER_10K
      },
      { status: 400 }
    );
  }

  console.log('[API GET /puzzles/create-set] Parsed params:', { target, size, margin, tailsPct, themes });

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
      _target: clampedTarget,
      _target_original: target,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct,
      _themes: themes
    });

    const { data, error } = await sb.rpc("create_puzzle_set", {
      _target: clampedTarget,
      _size: size,
      _margin: margin,
      _tails_pct: tailsPct,
      _themes: themes
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

      // Check if error is related to theme validation from Postgres
      if (error.message && error.message.toLowerCase().includes('theme')) {
        const allowedThemesStr = PUZZLE_THEMES_OVER_10K.join(', ');
        return NextResponse.json(
          {
            error: `Invalid themes provided. Allowed themes: ${allowedThemesStr}`,
            allowedThemes: PUZZLE_THEMES_OVER_10K
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const puzzles = data || [];
    console.log('[API GET /puzzles/create-set] Successfully retrieved', puzzles.length, 'puzzles');

    return NextResponse.json({
      target,
      size,
      margin,
      tailsPct,
      themes,
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
