// src/lib/api/puzzleApi.ts

"use client";

import { PuzzleSet } from "@/lib/types";
import { showConfirmDeletePopup } from "@/lib/utils/uiHelpers";

export const addIncorrectAttempt = async (
  setId: number,
  repeatIndex: number
) => {
  try {
    const res = await fetch("/api/addIncorrect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
    });

    const data = await res.json();

    if (!res.ok)
      throw new Error(data.error || "Failed to add incorrect attempt");

    return true;
  } catch (err) {
    console.error("Error adding incorrect attempt:", err);
    return false;
  }
};

export const addCorrectAttempt = async (setId: number, repeatIndex: number) => {
  try {
    console.log(
      "[addCorrectAttempt] called with setId:",
      setId,
      "repeatIndex:",
      repeatIndex
    );
    console.log("");

    const res = await fetch("/api/addCorrect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to add correct attempt");

    return true;
  } catch (err) {
    console.error("Error adding correct attempt:", err);
    return false;
  }
};

export const getAllSetData = async (email: string) => {
  const response = await fetch("/api/getSet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    console.error("Failed to fetch user sets");
    return null;
  }

  const result = await response.json();
  return result.sets as PuzzleSet[];
};

export const getSetAccuracy = async (setId: number, repeatIndex: number) => {
  try {
    const res = await fetch("/api/getSetAccuracy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
    });

    const data = await res.json();

    if (!res.ok) return { correct: 0, incorrect: 0 };

    return { correct: data.correct, incorrect: data.incorrect };
  } catch (err) {
    console.error("Error fetching set accuracy:", err);
    return null;
  }
};

export const getPuzzleData = async (puzzleId: string) => {
  const response = await fetch(`/api/getPuzzleById?id=${puzzleId}`);
  if (!response.ok) return null;
  return await response.json();
};

export const getSetProgress = async (set_id: number) => {
  const response = await fetch("/api/getSetProgressStats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id }),
  });

  if (!response.ok) return null;
  const result = await response.json();
  return result.progress;
};

export const setSetProgress = async (
  set_id: number,
  repeat_index: number,
  puzzle_index: number
) => {
  console.log("🛰️ [setSetProgress] Sending to API:", {
    set_id,
    repeat_index,
    puzzle_index,
  });

  const response = await fetch("/api/updateSetProgressStats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id, repeat_index, puzzle_index }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("❌ [setSetProgress] API failed:", result.error);
  } else {
    console.log("✅ [setSetProgress] API success:", result.message);
  }

  return response.ok;
};

export const handleSetDelete = async (
  setId: number,
  setUserSets: React.Dispatch<React.SetStateAction<PuzzleSet[]>>,
  setSelectedSetId: React.Dispatch<React.SetStateAction<number | null>>
) => {
  console.log("User clicked remove on this set:", setId);
  const confirmed = await showConfirmDeletePopup();
  if (!confirmed) {
    console.log("User cancelled set deletion.");
    return;
  }
  console.log("User confirmed set deletion.");

  const res = await fetch("/api/removeSet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id: setId }),
  });

  if (!res.ok) {
    console.log("Failed to delete set");
    return;
  }

  setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
  setSelectedSetId((prevId) => (prevId === setId ? null : prevId));
  sessionStorage.removeItem("selected_set_id");
};
