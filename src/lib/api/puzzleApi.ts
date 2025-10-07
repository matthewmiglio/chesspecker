// src/lib/api/puzzleApi.ts

"use client";

import { PuzzleSet } from "@/lib/types";
import { showConfirmDeletePopup } from "@/lib/utils/uiHelpers";
import { upsertAccuracy, getAccuracies } from "@/lib/api/accuraciesApi";

export const addIncorrectAttempt = async (
  setId: number,
  repeatIndex: number,
  timeTaken: number = 0
) => {
  try {
    const result = await upsertAccuracy({
      setId,
      repeatIndex,
      deltaIncorrect: 1,
      deltaTime: timeTaken
    });

    return result !== null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in addIncorrectAttempt:", message);
    return false;
  }
};

export const addCorrectAttempt = async (setId: number, repeatIndex: number, timeTaken: number = 0) => {
  try {
    const result = await upsertAccuracy({
      setId,
      repeatIndex,
      deltaCorrect: 1,
      deltaTime: timeTaken
    });

    return result !== null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in addCorrectAttempt:", message);
    return false;
  }
};

/**
 * Fetches all sets for the current user.
 * Uses the new secure API that validates session server-side.
 *
 * @deprecated The email parameter is no longer used - auth is handled server-side
 */
export const getAllSetData = async () => {
  const response = await fetch("/api/user/sets", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Include session cookies
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
    const accuracies = await getAccuracies(setId);
    const accuracy = accuracies.find(acc => acc.repeat_index === repeatIndex);

    if (!accuracy) return { correct: 0, incorrect: 0 };

    return { correct: accuracy.correct, incorrect: accuracy.incorrect };
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
  console.log('[puzzleApi] Getting set progress for:', set_id);

  const response = await fetch(`/api/user/sets/${set_id}/progress`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    console.error('[puzzleApi] Failed to get progress:', response.status);
    return null;
  }

  const result = await response.json();
  console.log('[puzzleApi] Progress result:', result);
  return result.progress;
};

export const setSetProgress = async (
  set_id: number,
  repeat_index: number,
  puzzle_index: number
) => {
  console.log('[puzzleApi] Setting progress:', { set_id, repeat_index, puzzle_index });

  const response = await fetch(`/api/user/sets/${set_id}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repeat_index, puzzle_index }),
  });

  if (!response.ok) {
    console.error('[puzzleApi] Failed to update progress:', response.status);
  }

  return response.ok;
};

export const handleSetDelete = async (
  setId: number,
  setUserSets: React.Dispatch<React.SetStateAction<PuzzleSet[]>>,
  setSelectedSetId: React.Dispatch<React.SetStateAction<number | null>>
) => {
  const confirmed = await showConfirmDeletePopup();
  if (!confirmed) {
    console.log('[puzzleApi] Delete cancelled by user');
    return;
  }

  console.log('[puzzleApi] Deleting set:', setId);

  const res = await fetch(`/api/user/sets/${setId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    console.error('[puzzleApi] Failed to delete set:', res.status);
    return;
  }

  console.log('[puzzleApi] Set deleted successfully');
  setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
  setSelectedSetId((prevId) => (prevId === setId ? null : prevId));
  sessionStorage.removeItem("selected_set_id");
};
