import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, count } = await req.json();

  if (!email || typeof count !== "number") {
    return NextResponse.json(
      { error: "Email and numeric count are required" },
      { status: 400 }
    );
  }

  const today = new Date().toISOString();

  // Fetch existing user (if any)
  const { data, error: fetchError } = await supabase
    .from("ChessPeckerUsers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const existing = data || {
    email,
    created_at: today,
    puzzle_starts: 0,
    correct_puzzles: 0,
    incorrect_puzzles: 0,
    set_creates: 0,
    hints: 0,
    puzzle_requests: 0,
  };

  const updated = {
    ...existing,
    puzzle_requests: (existing.puzzle_requests || 0) + count,
  };

  const { error: upsertError } = await supabase
    .from("ChessPeckerUsers")
    .upsert([updated], { onConflict: "email" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: `puzzle_requests incremented by ${count}` }, { status: 200 });
}
