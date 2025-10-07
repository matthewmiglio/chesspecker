import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/accuracies?setId=<number>
 *
 * Returns accuracy data for the authenticated user.
 * - If setId is provided: returns accuracies for that specific set
 * - If setId is omitted: returns all accuracies across all user's sets
 *
 * Calls get_set_accuracies() or get_all_accuracies_for_user() RPC functions.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call; RPC validates set ownership
 */
export async function GET(request: NextRequest) {
  // Validate session server-side
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const setIdParam = searchParams.get('setId');

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let data, error;

    if (setIdParam) {
      // Get accuracies for a specific set
      const setId = Number(setIdParam);

      if (isNaN(setId) || setId <= 0) {
        return NextResponse.json(
          { error: "Invalid setId parameter" },
          { status: 400 }
        );
      }

      const result = await supabase.rpc('get_set_accuracies', {
        user_email: session.user.email,
        p_set_id: setId
      });

      data = result.data;
      error = result.error;
    } else {
      // Get all accuracies for the user
      const result = await supabase.rpc('get_all_accuracies_for_user', {
        user_email: session.user.email
      });

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("[GET /api/user/accuracies] RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ accuracies: data ?? [] });
  } catch (err) {
    console.error("[GET /api/user/accuracies] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/accuracies
 *
 * Upserts accuracy data for a specific set and repeat index.
 * Increments correct/incorrect counts and sums time_taken.
 *
 * Body: {
 *   setId: number;
 *   repeatIndex: number;
 *   deltaCorrect?: number;    // default 0
 *   deltaIncorrect?: number;  // default 0
 *   deltaTime?: number | null // seconds; null/omitted = don't change
 * }
 *
 * Calls upsert_set_accuracy() RPC function.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call; RPC validates set ownership
 */
export async function POST(request: NextRequest) {
  // Validate session server-side
  const session = await getServerSession(authOptions);
  console.log('[POST /api/user/accuracies] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[POST /api/user/accuracies] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    console.log('[POST /api/user/accuracies] Request body:', body);

    // Validate required fields
    if (typeof body.setId !== 'number' || body.setId <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'setId' field" },
        { status: 400 }
      );
    }

    if (typeof body.repeatIndex !== 'number' || body.repeatIndex < 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'repeatIndex' field" },
        { status: 400 }
      );
    }

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call upsert_set_accuracy RPC
    console.log('[POST /api/user/accuracies] Calling RPC with params:', {
      user_email: session.user.email,
      p_set_id: body.setId,
      p_repeat_index: body.repeatIndex,
      delta_correct: body.deltaCorrect ?? 0,
      delta_incorrect: body.deltaIncorrect ?? 0,
      delta_time: body.deltaTime ?? null
    });

    const { data, error } = await supabase.rpc('upsert_set_accuracy', {
      user_email: session.user.email,
      p_set_id: body.setId,
      p_repeat_index: body.repeatIndex,
      delta_correct: body.deltaCorrect ?? 0,
      delta_incorrect: body.deltaIncorrect ?? 0,
      delta_time: body.deltaTime ?? null
    });

    if (error) {
      console.error("[POST /api/user/accuracies] RPC error:", error);
      console.error("[POST /api/user/accuracies] Full error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[POST /api/user/accuracies] RPC returned data:', data);

    // RPC returns TABLE(...), so data is an array; get first row
    const accuracy = Array.isArray(data) && data.length > 0 ? data[0] : null;
    console.log('[POST /api/user/accuracies] Parsed accuracy:', accuracy);

    return NextResponse.json({ accuracy });
  } catch (err) {
    console.error("[POST /api/user/accuracies] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
