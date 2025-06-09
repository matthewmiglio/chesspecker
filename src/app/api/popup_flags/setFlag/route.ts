// src/app/api/popup_flags/setFlag/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
  const { email, key, value } = await req.json();

  const { data, error } = await supabase
    .from("PopupFlags")
    .update({ [key]: value })
    .eq("email", email);

  if (error) {
    console.error("[setFlag] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
