"use client";

import type { ChessPeckerSet } from "@/types/chessPeckerSet";

/**
 * Fetches all chess pecker sets for the current user.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @returns Array of ChessPeckerSet objects, or empty array on error/not authenticated
 */
export const getUserSets = async (): Promise<ChessPeckerSet[]> => {
  try {
    const res = await fetch("/api/user/sets", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (!res.ok) {
      if (res.status === 401) {
        return []; // User not authenticated
      }
      throw new Error(`Failed to fetch sets: ${res.statusText}`);
    }

    const data = await res.json();
    return data.sets ?? [];
  } catch (err) {
    console.error("[setsApi] Error fetching sets:", err);
    return [];
  }
};

/**
 * Creates a new chess pecker set for the current user.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @param input - Set creation parameters
 * @returns The new set_id on success, or null on error
 */
export const createUserSet = async (input: {
  name: string;
  elo: number;
  size: number;
  repeats: number;
  puzzleIds?: string[];
}): Promise<number | null> => {
  try {
    const res = await fetch("/api/user/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Failed to create set: ${res.statusText}`);
    }

    const data = await res.json();
    return data.setId ?? null;
  } catch (err) {
    console.error("[setsApi] Error creating set:", err);
    return null;
  }
};

/**
 * Deletes a chess pecker set for the current user.
 * Authentication is handled server-side via NextAuth session cookies.
 * Ownership is verified server-side.
 *
 * @param setId - The ID of the set to delete
 * @returns true on success, false on error
 */
export const deleteUserSet = async (setId: number): Promise<boolean> => {
  try {
    console.log('[setsApi] Deleting set:', setId);

    const res = await fetch(`/api/user/sets/${setId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('[setsApi] Delete failed:', errorData);
      throw new Error(errorData.error || `Failed to delete set: ${res.statusText}`);
    }

    console.log('[setsApi] Set deleted successfully');
    return true;
  } catch (err) {
    console.error("[setsApi] Error deleting set:", err);
    return false;
  }
};
