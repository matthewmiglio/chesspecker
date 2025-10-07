import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/user/login-streak
 *
 * Updates the authenticated user's login streak.
 * - Creates row if user has no streak yet (login_count = 1)
 * - Increments count if last login was exactly 1 day ago
 * - Resets to 1 if gap > 1 day
 * - Idempotent if user already logged in today
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before database write
 */
export async function POST() {
  console.log('[API POST /user/login-streak] Request received');

  // Validate session server-side
  const session = await getServerSession(authOptions);
  console.log('[API POST /user/login-streak] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API POST /user/login-streak] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email = session.user.email.toLowerCase().trim();

  try {
    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log('[API POST /user/login-streak] Fetching row for:', email);

    // Fetch existing row
    const { data, error: fetchError } = await supabase
      .from("loginStreaks")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("[API POST /user/login-streak] Fetch error:", {
        code: fetchError.code,
        message: fetchError.message,
        email
      });
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!data) {
      // No existing row — insert fresh
      console.log('[API POST /user/login-streak] No row exists, inserting new row');

      const { error: insertError } = await supabase
        .from("loginStreaks")
        .insert({
          email,
          day_of_last_login: todayStr,
          login_count: 1,
        });

      if (insertError) {
        console.error("[API POST /user/login-streak] Insert error:", {
          code: insertError.code,
          message: insertError.message,
          email
        });
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      console.log('[API POST /user/login-streak] Successfully inserted new row');
      return NextResponse.json({ ok: true });
    }

    // Row exists - check if we need to update
    const lastLogin = new Date(data.day_of_last_login);
    const lastLoginStr = lastLogin.toISOString().split("T")[0];

    if (lastLoginStr === todayStr) {
      // Same day — idempotent, do nothing
      console.log('[API POST /user/login-streak] Already logged in today, no update needed');
      return NextResponse.json({ ok: true });
    }

    // Calculate days since last login
    const daysSince = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    let updatedCount = 1; // default: reset to 1
    if (daysSince === 1) {
      // Consecutive day - increment
      updatedCount = (data.login_count || 0) + 1;
      console.log('[API POST /user/login-streak] Consecutive login, incrementing count');
    } else {
      // Gap > 1 day - reset
      console.log('[API POST /user/login-streak] Gap in logins, resetting count');
    }

    const { error: updateError } = await supabase
      .from("loginStreaks")
      .update({
        day_of_last_login: todayStr,
        login_count: updatedCount,
      })
      .eq("email", email);

    if (updateError) {
      console.error("[API POST /user/login-streak] Update error:", {
        code: updateError.code,
        message: updateError.message,
        email,
        updatedCount
      });
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('[API POST /user/login-streak] Successfully updated row');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API POST /user/login-streak] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
