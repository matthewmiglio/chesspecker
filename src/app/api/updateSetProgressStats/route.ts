import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { set_id, repeat_index, puzzle_index } = await req.json();

  if (!set_id || repeat_index === undefined || puzzle_index === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chessPeckerSets")
    .update({ repeat_index, puzzle_index })
    .eq("set_id", set_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Set progress updated successfully" }, { status: 200 });
}
