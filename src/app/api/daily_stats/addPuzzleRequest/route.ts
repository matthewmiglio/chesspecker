import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { count } = await req.json();
  const increment = Number(count) || 1;

  const today = new Date().toISOString().split("T")[0];

  const { data, error: fetchError } = await supabase
    .from("DailyUsageStats")
    .select("puzzle_requests")
    .eq("day", today)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const newValue = (data?.puzzle_requests || 0) + increment;

  const { error: updateError } = await supabase
    .from("DailyUsageStats")
    .upsert([{ day: today, puzzle_requests: newValue }]);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: `Puzzle requests increased by ${increment}` },
    { status: 200 }
  );
}
