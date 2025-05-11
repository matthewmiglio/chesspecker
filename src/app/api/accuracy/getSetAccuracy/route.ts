import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { set_id, repeat_index } = await req.json();

  if (!set_id || repeat_index === undefined) {
    return NextResponse.json(
      { error: "Missing set_id or repeat_index" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("chessPeckerSetAccuracies")
    .select("correct, incorrect")
    .eq("set_id", set_id)
    .eq("repeat_index", repeat_index)
    .maybeSingle();

  if (error) {
    console.error("Supabase error in getSetAccuracy:", error);
    return NextResponse.json({ correct: 0, incorrect: 0 }, { status: 200 }); // Treat error as empty data
  }

  if (!data) {
    return NextResponse.json({ correct: 0, incorrect: 0 }, { status: 200 }); // No data yet? Fine, zero
  }

  return NextResponse.json(
    { correct: data.correct ?? 0, incorrect: data.incorrect ?? 0 },
    { status: 200 }
  );
}
