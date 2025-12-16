import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = session.user.email.toLowerCase().trim();

  // Upsert user - insert if not exists
  const { error } = await supabase
    .from("ChessPeckerUsers")
    .upsert(
      { email, tier: "free" },
      { onConflict: "email", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Failed to ensure user registration:", error);
    return NextResponse.json({ error: "Failed to ensure registration" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
