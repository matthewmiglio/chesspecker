// src/app/api/login_streak/update_login_streak/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // e.g., "2025-05-13"

  const { data, error } = await supabase
    .from("loginStreaks")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[update_login_streak] fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // No existing row — insert fresh
    const { error: insertError } = await supabase.from("loginStreaks").insert({
      email,
      day_of_last_login: todayStr,
      login_count: 1,
    });
    if (insertError) {
      console.error("[update_login_streak] insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ login_count: 1 });
  }

  const lastLogin = new Date(data.day_of_last_login);
  const daysSince = Math.floor(
    (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) {
    // Same day — do nothing
    return NextResponse.json({ login_count: data.login_count });
  }

  let updatedCount = 0;
  if (daysSince === 1) {
    updatedCount = data.login_count + 1;
  } else {
    updatedCount = 1;
  }

  const { error: updateError } = await supabase
    .from("loginStreaks")
    .update({
      day_of_last_login: todayStr,
      login_count: updatedCount,
    })
    .eq("email", email);

  if (updateError) {
    console.error("[update_login_streak] update error:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ login_count: updatedCount });
}
