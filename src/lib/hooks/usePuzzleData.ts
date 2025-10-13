"use client";

import {
  getSetAccuracy,
  getSetProgress,
  setSetProgress,
} from "@/lib/api/puzzleApi";
import { ChessPeckerPuzzle } from "@/lib/types";

import { bumpDailyUsage } from "@/lib/api/usageApi";

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
  setStartingFen: (fen: string) => void,
  setSolution: (solution: string[]) => void,
  setSolvedIndex: (index: number) => void,
  setHighlight: (highlight: string | null) => void
) => {
  console.log('[loadPuzzleAndInitialize] Starting');
  console.log('[loadPuzzleAndInitialize] Puzzle FEN:', puzzle.FEN);
  console.log('[loadPuzzleAndInitialize] Puzzle moves:', puzzle.Moves);
  console.log('[loadPuzzleAndInitialize] setFen function:', typeof setFen, setFen);

  const { Chess } = await import("chess.js");
  const chess = new Chess(puzzle.FEN);

  if (puzzle.Moves.length > 0) {
    const opponentSetupMove = puzzle.Moves[0];
    console.log('[loadPuzzleAndInitialize] Applying opponent setup move:', opponentSetupMove);
    chess.move({
      from: opponentSetupMove.slice(0, 2),
      to: opponentSetupMove.slice(2, 4),
      promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
    });
  }

  const startingFen = chess.fen();
  console.log('[loadPuzzleAndInitialize] Starting FEN after setup move:', startingFen);
  console.log('[loadPuzzleAndInitialize] CALLING setFen with:', startingFen);
  setFen(startingFen);
  console.log('[loadPuzzleAndInitialize] CALLED setFen');
  setStartingFen(startingFen);
  console.log('[loadPuzzleAndInitialize] CALLED setStartingFen');

  const playerSolution = puzzle.Moves.slice(1);
  console.log('[loadPuzzleAndInitialize] Player solution (moves 1+):', playerSolution);
  setSolution(playerSolution);
  setSolvedIndex(0);
  setHighlight(null);
  console.log('[loadPuzzleAndInitialize] Initialization complete');
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
  setStartingFen: (fen: string) => void,
  setSolution: (solution: string[]) => void,
  setSolvedIndex: (index: number) => void,
  setHighlight: (highlight: string | null) => void,
  setPlayerSide: (side: "w" | "b") => void,
  preloadedSet?: { repeat_index: number; puzzle_index: number }
) => {
  console.log('[handleSetSelect] Starting set selection, setId:', setId);

  //increment total daily stats
  bumpDailyUsage({ puzzle_starts: 1 });

  //increment user stats
  incrementUserPuzzleStart();

  setSelectedSetId(setId);
  sessionStorage.setItem("selected_set_id", String(setId));

  const set = userSets.find((s) => s.set_id === setId);

  if (!set || !set.elo || !set.size || set.puzzle_index == null) {
    console.log('[handleSetSelect] Set not found or invalid');
    return;
  }

  const puzzleIds = set.puzzle_ids;
  console.log('[handleSetSelect] Puzzle IDs:', puzzleIds);
  console.log('[handleSetSelect] Starting at puzzle index:', set.puzzle_index);
  setPuzzleIds(puzzleIds);


  const { getPuzzleData } = await import("@/lib/api/puzzleApi");
  const puzzleData = await getPuzzleData(puzzleIds[set.puzzle_index]);

  if (puzzleData) {
    console.log('[handleSetSelect] Got puzzle data, calling loadPuzzleAndInitialize');
    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setStartingFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    const { Chess } = await import("chess.js");
    const chess = new Chess(puzzleData.puzzle.FEN);
    // Determine player side after opponent's setup move
    if (puzzleData.puzzle.Moves.length > 0) {
      const opponentSetupMove = puzzleData.puzzle.Moves[0];
      console.log('[handleSetSelect] Determining player side, setup move:', opponentSetupMove);
      chess.move({
        from: opponentSetupMove.slice(0, 2),
        to: opponentSetupMove.slice(2, 4),
        promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
      });
    }
    const turn = chess.turn();
    console.log('[handleSetSelect] Player side:', turn);
    setPlayerSide(turn);
  } else {
    console.log('[handleSetSelect] No puzzle data found');
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
