import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { set_id } = await req.json();

  if (!set_id) {
    return NextResponse.json({ error: "Missing set_id" }, { status: 400 });
  }

  // Delete from chessPeckerSets
  const { error: setError } = await supabase
    .from("chessPeckerSets")
    .delete()
    .eq("set_id", set_id);

  if (setError) {
    return NextResponse.json({ error: setError.message }, { status: 500 });
  }

  // Delete from chessPeckerSetAccuracies
  const { error: accError } = await supabase
    .from("chessPeckerSetAccuracies")
    .delete()
    .eq("set_id", set_id);

  if (accError) {
    return NextResponse.json({ error: accError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Set and related accuracy records deleted successfully" },
    { status: 200 }
  );
}
