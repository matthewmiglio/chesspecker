// src/lib/api/feedbackApi.ts
"use client";

const BASE = "/api/feedback";

export async function submitFeedback({
  email,
  name,
  message,
}: {
  email: string;
  name: string;
  message: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/addFormSubmission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, message }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
    return true;
  } catch (err) {
    console.error("[feedbackApi] submitFeedback error:", err);
    return false;
  }
}

export async function fetchAllFeedback() {
  try {
    const res = await fetch(`${BASE}/getAll`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch feedback");
    return data.feedback;
  } catch (err) {
    console.error("[feedbackApi] fetchAllFeedback error:", err);
    return [];
  }
}
