"use client";

/**
 * Fetches the current user's pseudoname from the server.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @returns The user's pseudoname, or null if not set or on error
 */
export const getPseudoname = async (): Promise<string | null> => {
  try {
    const res = await fetch("/api/user/pseudoname", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (!res.ok) {
      if (res.status === 401) {
        return null; // User not authenticated
      }
      throw new Error(`Failed to fetch pseudoname: ${res.statusText}`);
    }

    const data = await res.json();
    return data.pseudoname ?? null;
  } catch (err) {
    console.error("[pseudonameApi] Error fetching pseudoname:", err);
    return null;
  }
};
