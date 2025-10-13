import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/usage/daily
 *
 * Increments today's DailyUsageStats counters.
 * No session required - this is app-level usage tracking.
 *
 * Body: {
 *   correct_puzzles?: number;
 *   incorrect_puzzles?: number;
 *   puzzle_starts?: number;
 *   set_creates?: number;
 *   puzzle_requests?: number;
 * }
 *
 * All fields are optional and default to 0.
 * Uses SERVICE_ROLE key to write to write-only table.
 */
export async function POST(request: NextRequest) {
  console.log('[API POST /usage/daily] Request received');

  try {
    const body = await request.json();
    console.log('[API POST /usage/daily] Request body:', body);

    // Sanitize: coerce to integers, clamp < 0 to 0
    const toInt = (val: unknown): number => {
      const num = Number(val);
      if (isNaN(num)) return 0;
      const int = Math.floor(num);
      return int < 0 ? 0 : int;
    };

    const deltas = {
      correct_puzzles: toInt(body.correct_puzzles),
      incorrect_puzzles: toInt(body.incorrect_puzzles),
      puzzle_starts: toInt(body.puzzle_starts),
      set_creates: toInt(body.set_creates),
      puzzle_requests: toInt(body.puzzle_requests),
    };

    console.log('[API POST /usage/daily] Parsed deltas:', deltas);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Create Supabase client with SERVICE ROLE key
    // This allows us to bypass RLS and write to the write-only table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[API POST /usage/daily] Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      supabaseUrl
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[API POST /usage/daily] Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('[API POST /usage/daily] Fetching today\'s row:', today);

    // Read today's row (service role can read)
    const { data, error: fetchError } = await supabase
      .from("DailyUsageStats")
      .select("*")
      .eq("day", today)
      .maybeSingle();

    if (fetchError) {
      console.error("[API POST /usage/daily] Fetch error:", {
        code: fetchError.code,
        message: fetchError.message,
        today
      });
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!data) {
      // No row for today yet - insert fresh row
      console.log('[API POST /usage/daily] No row exists, inserting new row');

      const { error: insertError } = await supabase
        .from("DailyUsageStats")
        .insert({
          day: today,
          correct_puzzles: deltas.correct_puzzles,
          incorrect_puzzles: deltas.incorrect_puzzles,
          puzzle_starts: deltas.puzzle_starts,
          set_creates: deltas.set_creates,
          puzzle_requests: deltas.puzzle_requests,
        });

      if (insertError) {
        console.error("[API POST /usage/daily] Insert error:", {
          code: insertError.code,
          message: insertError.message,
          deltas
        });
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      console.log('[API POST /usage/daily] Successfully inserted new row');
      return NextResponse.json({ ok: true });
    }

    // Row exists - update by adding deltas to existing values
    console.log('[API POST /usage/daily] Row exists, updating with deltas');

    const updated = {
      correct_puzzles: (data.correct_puzzles || 0) + deltas.correct_puzzles,
      incorrect_puzzles: (data.incorrect_puzzles || 0) + deltas.incorrect_puzzles,
      puzzle_starts: (data.puzzle_starts || 0) + deltas.puzzle_starts,
      set_creates: (data.set_creates || 0) + deltas.set_creates,
      puzzle_requests: (data.puzzle_requests || 0) + deltas.puzzle_requests,
    };

    const { error: updateError } = await supabase
      .from("DailyUsageStats")
      .update(updated)
      .eq("day", today);

    if (updateError) {
      console.error("[API POST /usage/daily] Update error:", {
        code: updateError.code,
        message: updateError.message,
        deltas,
        updated
      });
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('[API POST /usage/daily] Successfully updated row');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API POST /usage/daily] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
