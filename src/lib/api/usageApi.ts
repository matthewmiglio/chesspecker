"use client";

/**
 * Increments today's DailyUsageStats counters.
 * No authentication required - this is app-level usage tracking.
 *
 * @param deltas - Object with stat fields to increment (all optional, default to 0)
 * @returns true if successful, false on error
 */
export const bumpDailyUsage = async (deltas: Partial<{
  correct_puzzles: number;
  incorrect_puzzles: number;
  puzzle_starts: number;
  set_creates: number;
  puzzle_requests: number;
}>): Promise<boolean> => {
  try {
    const res = await fetch("/api/usage/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(deltas ?? {}),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to bump daily usage: ${text}`);
    }

    return true;
  } catch (err) {
    console.error("[usageApi] bumpDailyUsage error:", err);
    return false;
  }
};
