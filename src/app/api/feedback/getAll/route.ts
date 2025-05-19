// src/app/api/feedback/getAll/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("ChessPeckerFeedback")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("[getAllFeedback] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feedback: data }, { status: 200 });
}
