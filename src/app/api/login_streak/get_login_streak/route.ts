// src/app/api/login_streak/get_login_streak/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  const { data, error } = await supabase
    .from("loginStreaks")
    .select("login_count")
    .eq("email", email)
    .single();

  if (error) {
    console.error("[get_login_streak] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ login_count: data.login_count });
}
