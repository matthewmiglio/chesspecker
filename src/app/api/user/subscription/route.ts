import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth/authOptions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase();

    // Get user's subscription info
    const { data: userData, error } = await supabase
      .from("ChessPeckerUsers")
      .select("tier, subscription_status, subscription_ends_at")
      .eq("email", email)
      .single();

    if (error || !userData) {
      // User doesn't exist yet - they're free tier
      return NextResponse.json({
        tier: "free",
        subscription_status: null,
        subscription_ends_at: null,
      });
    }

    return NextResponse.json({
      tier: userData.tier || "free",
      subscription_status: userData.subscription_status,
      subscription_ends_at: userData.subscription_ends_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching subscription:", message);
    return NextResponse.json(
      { error: `Failed to fetch subscription: ${message}` },
      { status: 500 }
    );
  }
}
