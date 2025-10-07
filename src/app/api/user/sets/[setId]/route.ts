import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { createClient } from "@supabase/supabase-js";

/**
 * DELETE /api/user/sets/[setId]
 *
 * Deletes a chess pecker set and its associated accuracy records.
 * Only the owner (authenticated user) can delete their sets.
 *
 * Authentication: Requires valid NextAuth session
 * Authorization: Verifies set ownership via email match
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId: setIdStr } = await params;
  console.log('[API DELETE /user/sets/:setId] Request for setId:', setIdStr);

  const session = await getServerSession(authOptions);
  console.log('[API DELETE /user/sets/:setId] Session:', session?.user?.email || 'No session');

  if (!session?.user?.email) {
    console.error('[API DELETE /user/sets/:setId] Unauthorized - no session');
    return NextResponse.json(
      { error: "Unauthorized: No active session" },
      { status: 401 }
    );
  }

  const setId = parseInt(setIdStr, 10);
  if (isNaN(setId)) {
    console.error('[API DELETE /user/sets/:setId] Invalid setId:', setIdStr);
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

    // First verify the set belongs to this user
    console.log('[API DELETE /user/sets/:setId] Verifying ownership');
    const { data: setData, error: fetchError } = await supabase
      .from("chessPeckerSets")
      .select("email")
      .eq("set_id", setId)
      .single();

    if (fetchError || !setData) {
      console.error('[API DELETE /user/sets/:setId] Set not found:', fetchError);
      return NextResponse.json(
        { error: "Set not found" },
        { status: 404 }
      );
    }

    if (setData.email !== session.user.email) {
      console.error('[API DELETE /user/sets/:setId] Ownership mismatch');
      return NextResponse.json(
        { error: "Unauthorized: You do not own this set" },
        { status: 403 }
      );
    }

    // Delete accuracy records first
    console.log('[API DELETE /user/sets/:setId] Deleting accuracy records');
    const { error: accError } = await supabase
      .from("chessPeckerSetAccuracies")
      .delete()
      .eq("set_id", setId);

    if (accError) {
      console.error('[API DELETE /user/sets/:setId] Error deleting accuracies:', accError);
      return NextResponse.json(
        { error: accError.message },
        { status: 500 }
      );
    }

    // Delete the set
    console.log('[API DELETE /user/sets/:setId] Deleting set');
    const { error: setError } = await supabase
      .from("chessPeckerSets")
      .delete()
      .eq("set_id", setId);

    if (setError) {
      console.error('[API DELETE /user/sets/:setId] Error deleting set:', setError);
      return NextResponse.json(
        { error: setError.message },
        { status: 500 }
      );
    }

    console.log('[API DELETE /user/sets/:setId] Successfully deleted');
    return NextResponse.json(
      { message: "Set and related accuracy records deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API DELETE /user/sets/:setId] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
