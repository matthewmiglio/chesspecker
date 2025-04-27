"use client";

import {
  getSetAccuracy,
  getSetProgress,
  setSetProgress,
} from "@/lib/api/puzzleApi";
import { PuzzleData } from "@/lib/types";
import { getFenAtPly } from "@/lib/utils/puzzleUtils";

export const updateThisSetAccuracy = async (
  setId: number,
  setAccuracies: React.Dispatch<
    React.SetStateAction<Record<number, { correct: number; incorrect: number }>>
  >
) => {
  const progress = await getSetProgress(setId);
  if (!progress) {
    console.warn("No progress found for set id:", setId);
    return;
  }

  const { repeat_index } = progress;
  const accuracyStats = await getSetAccuracy(setId, repeat_index);
  const correct = accuracyStats?.correct || 0;
  const incorrect = accuracyStats?.incorrect || 0;

  console.log("\tUpdating set accuracy:", setId);
  console.log("\tCorrect:", correct, "Incorrect:", incorrect);

  setAccuracies((prev) => ({
    ...prev,
    [setId]: { correct, incorrect },
  }));
};

export const updatePuzzleProgress = async (
  setId: number,
  setCurrentRepeatIndex: (index: number) => void,
  setCurrentPuzzleIndex: (index: number) => void
) => {
  const progress = await getSetProgress(setId);
  if (!progress) {
    console.warn("No progress found for set id:", setId);
    return;
  }

  setCurrentRepeatIndex(progress.repeat_index);
  setCurrentPuzzleIndex(progress.puzzle_index);
};

export const incrementPuzzleIndex = async (
  setId: number,
  setCurrentRepeatIndex: (index: number) => void,
  setCurrentPuzzleIndex: (index: number) => void
) => {
  console.log("incrementPuzzleIndex() for set", setId);

  const progress = await getSetProgress(setId);
  if (!progress) {
    console.warn("No progress found for set id:", setId);
    return 0;
  }

  let { repeat_index, puzzle_index, size } = progress;

  if (puzzle_index + 1 === size) {
    puzzle_index = 0;
    repeat_index++;
  } else {
    puzzle_index++;
  }

  await setSetProgress(setId, repeat_index, puzzle_index);

  console.log("New progress - puzzle:", puzzle_index, "repeat:", repeat_index);
  setCurrentRepeatIndex(repeat_index);
  setCurrentPuzzleIndex(puzzle_index);

  return puzzle_index;
};

export const loadPuzzleAndInitialize = async (
  puzzleData: PuzzleData,
  setFen: (fen: string) => void,
  setSolution: (solution: string[]) => void,
  setSolvedIndex: (index: number) => void,
  setHighlight: (highlight: string | null) => void
) => {
  console.log("➡️ [loadPuzzleAndInitialize] START for puzzleId:", puzzleData.puzzle.id);

  const fen = getFenAtPly(
    puzzleData.game.pgn,
    puzzleData.puzzle.initialPly + 1
  );

  console.log("♟️ [loadPuzzleAndInitialize] Setting FEN:", fen);
  console.log("📜 [loadPuzzleAndInitialize] Setting solution moves:", puzzleData.puzzle.solution);

  setFen(fen);
  setSolution(puzzleData.puzzle.solution);
  setSolvedIndex(0);
  setHighlight(null);

  console.log("✅ [loadPuzzleAndInitialize] END");
};


export const handleSetSelect = async (
  setId: number,
  userSets: {
    set_id: number;
    puzzle_ids: string[];
    puzzle_index: number;
    elo: number;
    size: number;
  }[],
  setSelectedSetId: (id: number) => void,
  setPuzzleIds: (ids: string[]) => void,
  setCurrentRepeatIndex: (index: number) => void,
  setCurrentPuzzleIndex: (index: number) => void,
  setFen: (fen: string) => void,
  setSolution: (solution: string[]) => void,
  setSolvedIndex: (index: number) => void,
  setHighlight: (highlight: string | null) => void,
  setPlayerSide: (side: "w" | "b") => void,
  preloadedSet?: { repeat_index: number; puzzle_index: number }
) => {
  console.log("➡️ [handleSetSelect] START setId:", setId);

  setSelectedSetId(setId);
  sessionStorage.setItem("selected_set_id", String(setId));

  const set = userSets.find((s) => s.set_id === setId);

  if (!set || !set.elo || !set.size || set.puzzle_index == null) {
    console.warn("⚠️ [handleSetSelect] Invalid set data:", set);
    return;
  }

  const puzzleIds = set.puzzle_ids;
  setPuzzleIds(puzzleIds);

  console.log("📦 [handleSetSelect] Loading puzzleId:", puzzleIds[set.puzzle_index]);

  const { getPuzzleData } = await import("@/lib/api/puzzleApi");
  const puzzle = await getPuzzleData(puzzleIds[set.puzzle_index]);

  if (puzzle) {
    console.log("✅ [handleSetSelect] Loaded puzzle successfully");
    await loadPuzzleAndInitialize(
      puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    const { Chess } = await import("chess.js");
    const chess = new Chess();
    if (puzzle.game.fen) {
      chess.load(puzzle.game.fen);
    } else if (puzzle.game.pgn) {
      chess.loadPgn(puzzle.game.pgn);
    }

    const turn = chess.turn();
    setPlayerSide(turn);
    console.log("🧩 [handleSetSelect] Player side set to:", turn);
  } else {
    console.warn("⚠️ [handleSetSelect] Failed to load puzzle");
    return;
  }

  if (preloadedSet) {
    console.log("📌 [handleSetSelect] Using preloadedSet:", preloadedSet);
    setCurrentRepeatIndex(preloadedSet.repeat_index);
    setCurrentPuzzleIndex(preloadedSet.puzzle_index);
  } else {
    console.log("🌐 [handleSetSelect] Fetching set progress...");
    const progress = await getSetProgress(setId);
    if (progress) {
      console.log("📌 [handleSetSelect] Server progress:", progress);
      setCurrentRepeatIndex(progress.repeat_index);
      setCurrentPuzzleIndex(progress.puzzle_index);
    } else {
      console.warn("⚠️ [handleSetSelect] Failed to fetch set progress");
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  console.log("✅ [handleSetSelect] END");
};

