// src/lib/api/puzzleApi.ts

"use client";

import { PuzzleSet } from "@/lib/types";
import { showConfirmDeletePopup } from "@/lib/utils/uiHelpers";

export const addIncorrectAttempt = async (
  setId: number,
  repeatIndex: number,
  timeTaken: number = 0
) => {
  try {
    const res = await fetch("/api/accuracy/addIncorrect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex, time_taken: timeTaken }),
    });

    const data = await res.json();

    if (!res.ok)
      throw new Error(data.error || "Failed to add incorrect attempt");

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in addIncorrectAttempt:", message);
    return false;
  }
};

export const addCorrectAttempt = async (setId: number, repeatIndex: number, timeTaken: number = 0) => {
  try {

    const res = await fetch("/api/accuracy/addCorrect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex, time_taken: timeTaken }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to add correct attempt");

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in addCorrectAttempt:", message);
    return false;
  }
};

export const getAllSetData = async (email: string) => {
  const response = await fetch("/api/sets/getSet", {
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
    const res = await fetch("/api/accuracy/getSetAccuracy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
    });

    const data = await res.json();

    if (!res.ok) return { correct: 0, incorrect: 0 };

    return { correct: data.correct, incorrect: data.incorrect };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in getSetAccuracy:", message);

    return null;
  }
};

export const getPuzzleData = async (puzzleId: string): Promise<{ puzzle: import("@/types/supabasePuzzle").ChessPeckerPuzzle } | null> => {
  const response = await fetch(`/api/puzzles/${puzzleId}`);
  if (!response.ok) return null;
  return await response.json();
};

export const getSetProgress = async (set_id: number) => {
  const response = await fetch("/api/sets/getSetProgressStats", {
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

  const response = await fetch("/api/sets/updateSetProgressStats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id, repeat_index, puzzle_index }),
  });

  return response.ok;
};

export const handleSetDelete = async (
  setId: number,
  setUserSets: React.Dispatch<React.SetStateAction<PuzzleSet[]>>,
  setSelectedSetId: React.Dispatch<React.SetStateAction<number | null>>
) => {
  const confirmed = await showConfirmDeletePopup();
  if (!confirmed) {
    return;
  }

  const res = await fetch("/api/sets/removeSet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_id: setId }),
  });

  if (!res.ok) {
    return;
  }

  setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
  setSelectedSetId((prevId) => (prevId === setId ? null : prevId));
  sessionStorage.removeItem("selected_set_id");
};
