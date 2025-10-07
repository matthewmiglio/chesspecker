import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/sets/[setId]/progress
 *
 * Gets progress stats for a specific set (repeat_index, puzzle_index, size, repeats).
 * Only the owner (authenticated user) can access their set progress.
 *
 * Authentication: Requires valid NextAuth session
 * Authorization: Verifies set ownership via email match
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId: setIdStr } = await params;
  console.log('[API GET /user/sets/:setId/progress] Request for setId:', setIdStr);

  const session = await getServerSession(authOptions);
  console.log('[API GET /user/sets/:setId/progress] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API GET /user/sets/:setId/progress] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  const setId = parseInt(setIdStr, 10);
  if (isNaN(setId)) {
    console.error('[API GET /user/sets/:setId/progress] Invalid setId:', setIdStr);
    return NextResponse.json(
      { error: "Invalid set ID" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[API GET /user/sets/:setId/progress] Fetching set progress');
    const { data, error } = await supabase
      .from("chessPeckerSets")
      .select("email, repeat_index, puzzle_index, size, repeats")
      .eq("set_id", setId)
      .single();

    if (error) {
      console.error('[API GET /user/sets/:setId/progress] Supabase error:', error);
      return NextResponse.json(
        { error: "Set not found or fetch error" },
        { status: 404 }
      );
    }

    if (!data) {
      console.error('[API GET /user/sets/:setId/progress] No data found');
      return NextResponse.json(
        { error: "Set not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (data.email !== session.user.email) {
      console.error('[API GET /user/sets/:setId/progress] Ownership mismatch');
      return NextResponse.json(
        { error: "Unauthorized: You do not own this set" },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...progress } = data;
    console.log('[API GET /user/sets/:setId/progress] Progress data:', progress);

    return NextResponse.json({ progress }, { status: 200 });
  } catch (err) {
    console.error("[API GET /user/sets/:setId/progress] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/sets/[setId]/progress
 *
 * Updates progress stats for a specific set.
 * Only the owner (authenticated user) can update their set progress.
 *
 * Body: { repeat_index: number, puzzle_index: number }
 *
 * Authentication: Requires valid NextAuth session
 * Authorization: Verifies set ownership via email match
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId: setIdStr } = await params;
  console.log('[API PATCH /user/sets/:setId/progress] Request for setId:', setIdStr);

  const session = await getServerSession(authOptions);
  console.log('[API PATCH /user/sets/:setId/progress] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API PATCH /user/sets/:setId/progress] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  const setId = parseInt(setIdStr, 10);
  if (isNaN(setId)) {
    console.error('[API PATCH /user/sets/:setId/progress] Invalid setId:', setIdStr);
    return NextResponse.json(
      { error: "Invalid set ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { repeat_index, puzzle_index } = body;

    if (typeof repeat_index !== 'number' || typeof puzzle_index !== 'number') {
      console.error('[API PATCH /user/sets/:setId/progress] Invalid body:', body);
      return NextResponse.json(
        { error: "Missing or invalid repeat_index or puzzle_index" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify ownership first
    console.log('[API PATCH /user/sets/:setId/progress] Verifying ownership');
    const { data: setData, error: fetchError } = await supabase
      .from("chessPeckerSets")
      .select("email")
      .eq("set_id", setId)
      .single();

    if (fetchError || !setData) {
      console.error('[API PATCH /user/sets/:setId/progress] Set not found:', fetchError);
      return NextResponse.json(
        { error: "Set not found" },
        { status: 404 }
      );
    }

    if (setData.email !== session.user.email) {
      console.error('[API PATCH /user/sets/:setId/progress] Ownership mismatch');
      return NextResponse.json(
        { error: "Unauthorized: You do not own this set" },
        { status: 403 }
      );
    }

    // Update progress
    console.log('[API PATCH /user/sets/:setId/progress] Updating progress:', { repeat_index, puzzle_index });
    const { error: updateError } = await supabase
      .from("chessPeckerSets")
      .update({ repeat_index, puzzle_index })
      .eq("set_id", setId);

    if (updateError) {
      console.error('[API PATCH /user/sets/:setId/progress] Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log('[API PATCH /user/sets/:setId/progress] Successfully updated');
    return NextResponse.json(
      { message: "Progress updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API PATCH /user/sets/:setId/progress] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
