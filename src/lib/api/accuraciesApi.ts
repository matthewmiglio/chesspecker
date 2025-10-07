"use client";

/**
 * Shared type for accuracy rows returned from the API
 */
export type AccuracyRow = {
  set_id: number;
  repeat_index: number;
  correct: number;
  incorrect: number;
  time_taken: number | null;
  created_at: string; // ISO timestamp
};

/**
 * Fetches accuracy data for the authenticated user.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @param setId - Optional set ID to filter by. If omitted, returns all accuracies for the user.
 * @returns Array of accuracy rows, or empty array on error/not authenticated
 */
export const getAccuracies = async (setId?: number): Promise<AccuracyRow[]> => {
  try {
    const url = setId
      ? `/api/user/accuracies?setId=${setId}`
      : "/api/user/accuracies";

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
    });

    if (!res.ok) {
      if (res.status === 401) {
        return []; // User not authenticated
      }
      throw new Error(`Failed to fetch accuracies: ${res.statusText}`);
    }

    const data = await res.json();
    return data.accuracies ?? [];
  } catch (err) {
    console.error("[accuraciesApi] Error fetching accuracies:", err);
    return [];
  }
};

/**
 * Upserts accuracy data for a specific set and repeat index.
 * Authentication is handled server-side via NextAuth session cookies.
 *
 * @param input - Accuracy update parameters
 * @returns The updated accuracy row, or null on error
 */
export const upsertAccuracy = async (input: {
  setId: number;
  repeatIndex: number;
  deltaCorrect?: number;
  deltaIncorrect?: number;
  deltaTime?: number | null;
}): Promise<AccuracyRow | null> => {
  try {
    const res = await fetch("/api/user/accuracies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include session cookies
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return null; // User not authenticated
      }
      const errorData = await res.json();
      throw new Error(errorData.error || `Failed to upsert accuracy: ${res.statusText}`);
    }

    const data = await res.json();
    return data.accuracy ?? null;
  } catch (err) {
    console.error("[accuraciesApi] Error upserting accuracy:", err);
    return null;
  }
};
