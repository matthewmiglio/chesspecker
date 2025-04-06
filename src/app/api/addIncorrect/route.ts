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

  const { error } = await supabase.rpc("increment_incorrect", {
    input_set_id: set_id,
    input_repeat_index: repeat_index,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Incorrect incremented" }, { status: 200 });
}
