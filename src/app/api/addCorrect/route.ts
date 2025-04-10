import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { set_id, repeat_index } = await req.json();

  if (!set_id || repeat_index === undefined) {
    return NextResponse.json({ error: "Missing set_id or repeat_index" }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("chessPeckerSetAccuracies")
    .select("correct")
    .eq("set_id", set_id)
    .eq("repeat_index", repeat_index)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: fetchError?.message || "Accuracy row not found" }, { status: 500 });
  }

  const newCorrect = data.correct + 1;

  const { error: updateError } = await supabase
    .from("chessPeckerSetAccuracies")
    .update({ correct: newCorrect })
    .eq("set_id", set_id)
    .eq("repeat_index", repeat_index);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Correct incremented" }, { status: 200 });
}
