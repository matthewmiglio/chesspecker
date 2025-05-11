import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, email, elo, size, repeats, puzzleIds } =
    await req.json();

  const { data, error } = await supabase
    .from("chessPeckerSets")
    .insert([
      {
        name,
        email,
        elo,
        size,
        repeats,
        puzzle_ids: puzzleIds,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Set creation failed" }, { status: 500 });
  }

  return NextResponse.json({ set: data[0] }, { status: 201 });
}
