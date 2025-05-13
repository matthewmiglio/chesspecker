"use client";

const BASE = "/api/login_streak";

/**
 * Fetches the current login streak count for a user.
 * @param email - The user's email address
 */
export const getLoginStreak = async (email: string): Promise<number | null> => {
  try {
    const res = await fetch(`${BASE}/get_login_streak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get login streak");

    return data.login_count;
  } catch (err) {
    console.error("[loginStreakApi] getLoginStreak error:", err);
    return null;
  }
};

/**
 * Updates the login streak for a user:
 * - Increments if last login was exactly one day ago
 * - Resets if it's been more than one day
 * - Does nothing if user already logged in today
 * @param email - The user's email address
 */
export const updateLoginStreak = async (
  email: string
): Promise<number | null> => {
  try {
    const res = await fetch(`${BASE}/update_login_streak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update login streak");

    return data.login_count;
  } catch (err) {
    console.error("[loginStreakApi] updateLoginStreak error:", err);
    return null;
  }
};
