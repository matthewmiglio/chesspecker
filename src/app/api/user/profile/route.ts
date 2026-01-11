import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Validation schema for updating username
const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username must be at least 1 character")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers")
    .nullable(),
});

/**
 * GET /api/user/profile
 *
 * Returns the authenticated user's profile including username.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("ChessPeckerUsers")
      .select("email, username, tier")
      .eq("email", session.user.email)
      .single();

    if (error) {
      console.error("[API GET /user/profile] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[API GET /user/profile] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 *
 * Updates the authenticated user's username.
 *
 * Body: { username: string | null }
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = updateUsernameSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { username } = validation.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already has a username (usernames are permanent once set)
    const { data: currentUser } = await supabase
      .from("ChessPeckerUsers")
      .select("username")
      .eq("email", session.user.email)
      .single();

    if (currentUser?.username) {
      return NextResponse.json(
        { error: "Username cannot be changed once set" },
        { status: 403 }
      );
    }

    // Check if username is already taken (case-insensitive)
    if (username) {
      const { data: existing } = await supabase
        .from("ChessPeckerUsers")
        .select("email")
        .ilike("username", username)
        .neq("email", session.user.email)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    // Update username
    const { data, error } = await supabase
      .from("ChessPeckerUsers")
      .update({ username })
      .eq("email", session.user.email)
      .select("email, username, tier")
      .single();

    if (error) {
      console.error("[API PUT /user/profile] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[API PUT /user/profile] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
