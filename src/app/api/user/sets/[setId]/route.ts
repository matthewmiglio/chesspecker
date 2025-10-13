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

    console.log('[API DELETE /user/sets/:setId] Calling delete_user_set RPC');

    // Call the delete_user_set SQL function
    // This function handles ownership verification, cascading deletes, and returns stats
    const { data, error } = await supabase
      .rpc('delete_user_set', {
        user_email: session.user.email,
        p_set_id: setId
      });

    if (error) {
      console.error('[API DELETE /user/sets/:setId] RPC error:', error);

      // Handle specific error cases
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: "Set not found" },
          { status: 404 }
        );
      }

      if (error.message.includes('Forbidden') || error.message.includes('does not own')) {
        return NextResponse.json(
          { error: "Unauthorized: You do not own this set" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // data is an array with one row containing deletion stats
    const result = data?.[0];

    if (!result?.set_deleted) {
      console.error('[API DELETE /user/sets/:setId] Set was not deleted');
      return NextResponse.json(
        { error: "Failed to delete set" },
        { status: 500 }
      );
    }

    console.log('[API DELETE /user/sets/:setId] Successfully deleted:', {
      setId: result.deleted_set_id,
      accuraciesDeleted: result.accuracies_deleted
    });

    return NextResponse.json(
      {
        message: "Set and related accuracy records deleted successfully",
        deletedSetId: result.deleted_set_id,
        accuraciesDeleted: result.accuracies_deleted
      },
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
