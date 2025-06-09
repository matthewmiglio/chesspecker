// src/app/api/popup_flags/getFlag/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  const { data, error } = await supabase
    .from("PopupFlags")
    .select("*")
    .eq("email", email)
    .limit(1)
    .maybeSingle();


  console.log("[getFlag] Fetching popup flags for email:", email);
  if (!email) {
    console.error("[getFlag] No email provided");
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!data) {
    console.warn("[getFlag] No popup flags found for email:", email);
    return NextResponse.json({ data: {} }, { status: 200 });
  }
  console.log("[getFlag] Popup flags data:", data);


  if (error) {
    console.error("[getFlag] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
