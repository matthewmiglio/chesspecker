"use client";

/**
 * Updates the current user's login streak.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * - Increments if last login was exactly one day ago
 * - Resets if it's been more than one day
 * - Idempotent if user already logged in today
 *
 * @returns true if successful, false on error or if not authenticated
 */
export const bumpLoginStreak = async (): Promise<boolean> => {
  try {
    const res = await fetch("/api/user/login-streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (res.status === 401) {
      // Not logged in - this is expected, not an error
      return false;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to bump login streak: ${text}`);
    }

    return true;
  } catch (err) {
    console.error("[loginStreakApi] bumpLoginStreak error:", err);
    return false;
  }
};
