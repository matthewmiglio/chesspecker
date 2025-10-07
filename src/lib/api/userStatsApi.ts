"use client";

/**
 * Shared type for user stats returned from the API
 */
export type UserStats = {
  email: string;
  created_at: string; // ISO timestamp
  puzzle_starts: number;
  correct_puzzles: number;
  incorrect_puzzles: number;
  set_creates: number;
  hints: number;
  puzzle_requests: number;
};

/**
 * Fetches the current user's stats from the server.
 * Creates a stats row if it doesn't exist.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @returns The user's stats, or null if not authenticated or on error
 */
export const getUserStats = async (): Promise<UserStats | null> => {
  try {
    const res = await fetch("/api/user/stats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (res.status === 401) {
      return null; // User not authenticated
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch user stats: ${text}`);
    }

    const data = await res.json();
    return data.stats ?? null;
  } catch (err) {
    console.error("[userStatsApi] getUserStats error:", err);
    return null;
  }
};

/**
 * Input type for incrementing user stats
 */
type IncrementInput = Partial<Pick<UserStats,
  "puzzle_starts" | "correct_puzzles" | "incorrect_puzzles" |
  "set_creates" | "hints" | "puzzle_requests"
>>;

/**
 * Increments user stats counters.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @param deltas - Object with stat fields to increment (all optional, default to 0)
 * @returns The updated stats, or null if not authenticated or on error
 */
export const incrementUserStats = async (deltas: IncrementInput): Promise<UserStats | null> => {
  try {
    const res = await fetch("/api/user/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
      body: JSON.stringify(deltas),
    });

    if (res.status === 401) {
      return null; // User not authenticated
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to increment user stats: ${text}`);
    }

    const data = await res.json();
    return data.stats ?? null;
  } catch (err) {
    console.error("[userStatsApi] incrementUserStats error:", err);
    return null;
  }
};

/**
 * Convenience wrappers for incrementing individual stats
 */

export const incrementUserCorrect = async (): Promise<boolean> => {
  const result = await incrementUserStats({ correct_puzzles: 1 });
  return result !== null;
};

export const incrementUserIncorrect = async (): Promise<boolean> => {
  const result = await incrementUserStats({ incorrect_puzzles: 1 });
  return result !== null;
};

export const incrementUserHints = async (): Promise<boolean> => {
  const result = await incrementUserStats({ hints: 1 });
  return result !== null;
};

export const incrementUserPuzzleStart = async (): Promise<boolean> => {
  const result = await incrementUserStats({ puzzle_starts: 1 });
  return result !== null;
};

export const incrementUserSetCreate = async (): Promise<boolean> => {
  const result = await incrementUserStats({ set_creates: 1 });
  return result !== null;
};

export const incrementUserPuzzleRequests = async (count: number): Promise<boolean> => {
  const result = await incrementUserStats({ puzzle_requests: count });
  return result !== null;
};

/**
 * Admin function - fetches all user stats (kept for backwards compatibility)
 * @deprecated Consider creating a separate admin-only endpoint
 */
export const getAllUserStats = async () => {
  try {
    const res = await fetch("/api/userStats/getAll", { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch user stats");
    return data.users;
  } catch (err) {
    console.error("[userStatsApi] getAllUserStats error:", err);
    return null;
  }
};
