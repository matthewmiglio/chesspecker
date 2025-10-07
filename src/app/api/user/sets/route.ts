import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";

/**
 * GET /api/user/sets
 *
 * Returns all chess pecker sets for the authenticated user.
 * Calls get_user_sets() RPC function which returns sets ordered by create_time desc.
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call
 */
export async function GET() {
  console.log('[API /user/sets GET] Request received');

  // Validate session server-side
  const session = await getServerSession(authOptions);
  console.log('[API /user/sets GET] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API /user/sets GET] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  try {
    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[API /user/sets GET] Calling get_user_sets RPC for:', session.user.email);

    // Call get_user_sets() RPC function
    const { data, error } = await supabase
      .rpc('get_user_sets', { user_email: session.user.email });

    if (error) {
      console.error("[API /user/sets GET] RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[API /user/sets GET] RPC returned:', data, 'Count:', data?.length);

    // data is an array of sets
    return NextResponse.json({ sets: (data as ChessPeckerSet[]) ?? [] });
  } catch (err) {
    console.error("[API /user/sets GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/sets
 *
 * Creates a new chess pecker set for the authenticated user.
 * Calls create_user_set() RPC function which inserts a row and returns set_id.
 *
 * Body: { name: string, elo: number, size: number, repeats: number, puzzleIds?: string[] }
 *
 * Authentication: Requires valid NextAuth session (OAuth via Google)
 * Authorization: Session email validated before RPC call
 */
export async function POST(request: Request) {
  // Validate session server-side
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'name' field" },
        { status: 400 }
      );
    }

    if (typeof body.elo !== 'number') {
      return NextResponse.json(
        { error: "Missing or invalid 'elo' field" },
        { status: 400 }
      );
    }

    if (typeof body.size !== 'number' || body.size <= 0) {
      return NextResponse.json(
        { error: "'size' must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof body.repeats !== 'number' || body.repeats < 1) {
      return NextResponse.json(
        { error: "'repeats' must be at least 1" },
        { status: 400 }
      );
    }

    // puzzleIds is optional
    const puzzleIds = body.puzzleIds && Array.isArray(body.puzzleIds) ? body.puzzleIds : null;

    // Create Supabase client with SERVICE ROLE key to bypass RLS
    // This is secure because we've already validated the NextAuth session above
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call create_user_set() RPC function
    const { data, error } = await supabase
      .rpc('create_user_set', {
        user_email: session.user.email,
        set_name: body.name,
        target_elo: body.elo,
        set_size: body.size,
        num_repeats: body.repeats,
        puzzle_ids_in: puzzleIds
      });

    if (error) {
      console.error("[POST /api/user/sets] RPC error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // data is the set_id (bigint)
    return NextResponse.json({ setId: data });
  } catch (err) {
    console.error("[POST /api/user/sets] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
