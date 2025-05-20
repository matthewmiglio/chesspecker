"use client";

const BASE = "/api/userStats";

async function postTo(endpoint: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `POST to ${endpoint} failed`);
    return true;
  } catch (err) {
    console.error(`[userStatsApi] ${endpoint} error:`, err);
    return false;
  }
}

// New helper for endpoints requiring extra parameters
async function postToWithPayload(
  endpoint: string,
  payload: Record<string, any>
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `POST to ${endpoint} failed`);
    return true;
  } catch (err) {
    console.error(`[userStatsApi] ${endpoint} error:`, err);
    return false;
  }
}

export const incrementUserCorrect = (email: string) =>
  postTo("incrementCorrectPuzzles", email);

export const incrementUserIncorrect = (email: string) =>
  postTo("incrementIncorrectPuzzles", email);

export const incrementUserHints = (email: string) =>
  postTo("incrementHints", email);

export const incrementUserPuzzleStart = (email: string) =>
  postTo("incrementPuzzleStarts", email);

export const incrementUserSetCreate = (email: string) =>
  postTo("incrementSetCreates", email);

export const incrementUserPuzzleRequests = (
  email: string,
  count: number
): Promise<boolean> =>
  postToWithPayload("incrementPuzzleRequests", { email, count });

export const getAllUserStats = async () => {
  try {
    const res = await fetch(`${BASE}/getAll`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch user stats");
    return data.users;
  } catch (err) {
    console.error("[userStatsApi] getAllUserStats error:", err);
    return null;
  }
};
