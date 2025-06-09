// src/lib/api/popupFlagsApi.ts
"use client";

const BASE = "/api/popup_flags";

/**
 * Fetches all popup flag rows (admin/debug use).
 */
export const getAllPopupFlags = async () => {
  try {
    const res = await fetch(`${BASE}/getAll`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch popup flags");
    return data.data;
  } catch (err) {
    console.error("[popupFlagsApi] getAllPopupFlags error:", err);
    return null;
  }
};

/**
 * Fetches popup flags for a specific user.
 * @param email - The user's email address
 */
export const getPopupFlag = async (email: string) => {
  try {
    const res = await fetch(`${BASE}/getFlag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch popup flag");
    return data.data;
  } catch (err) {
    console.error("[popupFlagsApi] getPopupFlag error:", err);
    return null;
  }
};

/**
 * Updates a specific popup flag for a user.
 * @param email - The user's email
 * @param key - The flag column name to update
 * @param value - The boolean or string value to set
 */
export const setPopupFlag = async (
  email: string,
  key: string,
  value: boolean | string
) => {
  try {
    const res = await fetch(`${BASE}/setFlag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, key, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to set popup flag");
    return true;
  } catch (err) {
    console.error("[popupFlagsApi] setPopupFlag error:", err);
    return false;
  }
};
