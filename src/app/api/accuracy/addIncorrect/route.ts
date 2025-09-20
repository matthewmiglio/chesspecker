import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { set_id, repeat_index, time_taken = 0 } = await req.json();

  if (!set_id || repeat_index === undefined) {
    return NextResponse.json({ error: "Missing set_id or repeat_index" }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("chessPeckerSetAccuracies")
    .select("incorrect, time_taken")
    .eq("set_id", set_id)
    .eq("repeat_index", repeat_index);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No accuracy record found" }, { status: 404 });
  }

  // Use first record if duplicates exist (handles duplicate rows gracefully)
  const newIncorrect = data[0].incorrect + 1;
  const newTimeTaken = (data[0].time_taken || 0) + time_taken;

  const { error: updateError } = await supabase
    .from("chessPeckerSetAccuracies")
    .update({ incorrect: newIncorrect, time_taken: newTimeTaken })
    .eq("set_id", set_id)
    .eq("repeat_index", repeat_index);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Incorrect incremented" }, { status: 200 });
}
