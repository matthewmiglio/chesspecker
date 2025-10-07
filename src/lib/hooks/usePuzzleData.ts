"use client";

import {
  getSetAccuracy,
  getSetProgress,
  setSetProgress,
} from "@/lib/api/puzzleApi";
import { ChessPeckerPuzzle } from "@/lib/types";

import { incrementPuzzleStart } from "@/lib/api/dailyStatsApi";

import { incrementUserPuzzleStart } from "@/lib/api/userStatsApi";

export const updateThisSetAccuracy = async (
  setId: number,
  setAccuracies: React.Dispatch<
    React.SetStateAction<Record<number, { correct: number; incorrect: number }>>
  >
) => {
  const progress = await getSetProgress(setId);
  if (!progress) {
    return;
  }

  const { repeat_index } = progress;
  const accuracyStats = await getSetAccuracy(setId, repeat_index);
  const correct = accuracyStats?.correct || 0;
  const incorrect = accuracyStats?.incorrect || 0;

  setAccuracies((prev) => ({
    ...prev,
    [setId]: { correct, incorrect },
  }));
};

export const updatePuzzleProgress = async (
  setId: number,
  repeatIndex: number,
  puzzleIndex: number
) => {

  const { setSetProgress } = await import("@/lib/api/puzzleApi");

  await setSetProgress(setId, repeatIndex, puzzleIndex);

};

export const incrementPuzzleIndex = async (
  setId: number,
  setCurrentRepeatIndex: (index: number) => void,
  setCurrentPuzzleIndex: (index: number) => void
) => {
  const progress = await getSetProgress(setId);
  if (!progress) {
    return 0;
  }

  let repeat_index = progress.repeat_index;
  let puzzle_index = progress.puzzle_index;
  const size = progress.size;

  if (puzzle_index + 1 === size) {
    puzzle_index = 0;
    repeat_index++;
  } else {
    puzzle_index++;
  }

  await setSetProgress(setId, repeat_index, puzzle_index);

  setCurrentRepeatIndex(repeat_index);
  setCurrentPuzzleIndex(puzzle_index);

  return puzzle_index;
};

export const loadPuzzleAndInitialize = async (
  puzzle: ChessPeckerPuzzle,
  setFen: (fen: string) => void,
  setSolution: (solution: string[]) => void,
  setSolvedIndex: (index: number) => void,
  setHighlight: (highlight: string | null) => void
) => {
  const { Chess } = await import("chess.js");
  const chess = new Chess(puzzle.FEN);

  if (puzzle.Moves.length > 0) {
    const opponentSetupMove = puzzle.Moves[0];
    chess.move({
      from: opponentSetupMove.slice(0, 2),
      to: opponentSetupMove.slice(2, 4),
      promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
    });
  }

  const startingFen = chess.fen();
  setFen(startingFen);

  const playerSolution = puzzle.Moves.slice(1);
  setSolution(playerSolution);
  setSolvedIndex(0);
  setHighlight(null);
};

export const handleSetSelect = async (
  email: string,
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
  //increment total daily stats
  incrementPuzzleStart();

  //increment user stats
  incrementUserPuzzleStart();

  setSelectedSetId(setId);
  sessionStorage.setItem("selected_set_id", String(setId));

  const set = userSets.find((s) => s.set_id === setId);

  if (!set || !set.elo || !set.size || set.puzzle_index == null) {
    return;
  }

  const puzzleIds = set.puzzle_ids;
  setPuzzleIds(puzzleIds);


  const { getPuzzleData } = await import("@/lib/api/puzzleApi");
  const puzzleData = await getPuzzleData(puzzleIds[set.puzzle_index]);

  if (puzzleData) {
    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    const { Chess } = await import("chess.js");
    const chess = new Chess(puzzleData.puzzle.FEN);
    // Determine player side after opponent's setup move
    if (puzzleData.puzzle.Moves.length > 0) {
      const opponentSetupMove = puzzleData.puzzle.Moves[0];
      chess.move({
        from: opponentSetupMove.slice(0, 2),
        to: opponentSetupMove.slice(2, 4),
        promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
      });
    }
    const turn = chess.turn();
    setPlayerSide(turn);
  } else {
    return;
  }

  if (preloadedSet) {
    setCurrentRepeatIndex(preloadedSet.repeat_index);
    setCurrentPuzzleIndex(preloadedSet.puzzle_index);
  } else {
    const progress = await getSetProgress(setId);
    if (progress) {
      setCurrentRepeatIndex(progress.repeat_index);
      setCurrentPuzzleIndex(progress.puzzle_index);
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};
