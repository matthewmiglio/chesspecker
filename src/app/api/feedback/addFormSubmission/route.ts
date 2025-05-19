// src/app/api/feedback/addFormSubmission/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, name, message } = await req.json();

  if (!email || !message) {
    return NextResponse.json({ error: "Missing email or message" }, { status: 400 });
  }

  const { error } = await supabase.from("ChessPeckerFeedback").insert({
    email,
    text: `[${name ?? "Anonymous"}] ${message}`,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("[addFormSubmission] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Feedback submitted successfully" });
}
