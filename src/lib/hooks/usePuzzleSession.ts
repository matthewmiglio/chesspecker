"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { showConfetti, showGreenCheck, showRedX } from "@/lib/visuals";
import {
  parseUCIMove,
  puzzleIsFinished,
  setIsDone,
} from "@/lib/utils/puzzleUtils";
import { getPuzzleData } from "@/lib/api/puzzleApi";
import {
  loadPuzzleAndInitialize,
  updateThisSetAccuracy,
  updatePuzzleProgress,
} from "@/lib/hooks/usePuzzleData";

export function usePuzzleSession({
  getSelectedSetId,
  currentRepeatIndex,
  puzzleIds,
  fen,
  solution,
  solvedIndex,
  setFen,
  setSolution,
  setSolvedIndex,
  setHighlight,
  setCurrentRepeatIndex,
  setCurrentPuzzleIndex,
  setAccuracies,
  userSets,
  currentPuzzleIndex,
  setPlayerSide,
}: {
  getSelectedSetId: () => number | null;
  currentRepeatIndex: number;
  puzzleIds: string[];
  fen: string;
  solution: string[];
  solvedIndex: number;
  setFen: (fen: string) => void;
  setSolution: (solution: string[]) => void;
  setSolvedIndex: (index: number) => void;
  setHighlight: (square: string | null) => void;
  setCurrentRepeatIndex: (index: number) => void;
  setCurrentPuzzleIndex: (index: number) => void;
  setAccuracies: React.Dispatch<
    React.SetStateAction<Record<number, { correct: number; incorrect: number }>>
  >;
  userSets: { set_id: number; repeats: number }[];
  currentPuzzleIndex: number;
  setPlayerSide: (side: "w" | "b") => void;
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const handleIncorrectMove = async () => {
    console.log('"[handleIncorrectMove] called!");');
    const setId = getSelectedSetId();
    if (!setId) return;
    showRedX();
    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex);

    await showSolution();
    console.log("This puzzle was unsuccessful!");
    await handleNextPuzzle(true);
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    const setId = getSelectedSetId();
    if (!setId) {
      console.log(
        "[handleSuccessfulPuzzle] no selectedSetId, returning early."
      );
      return;
    }

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex);
    console.log(
      "[handleSuccessfulPuzzle] recorded correct attempt on server-side."
    );

    await handleNextPuzzle(forceFinish);
  };

  const handleMove = async (move: string, isCorrect: boolean) => {
    if (!isSessionActive) {
      console.log("[handleMove] session not active, returning early.");
      return;
    }

    if (!isCorrect) {
      console.log("[handleMove] move incorrect, calling handleIncorrectMove...");
      await handleIncorrectMove();
      return;
    }

    // Correct move played
    showGreenCheck();
    setHighlight(null);

    const newSolvedIndex = solvedIndex + 2;
    setSolvedIndex(newSolvedIndex);

    const chess = new Chess();
    chess.load(fen);
    chess.move(parseUCIMove(solution[solvedIndex]));

    const computerMove = solution[solvedIndex + 1];
    if (computerMove) {
      chess.move(parseUCIMove(computerMove));
    }

    const newFen = chess.fen();
    setFen(newFen);

    if (newSolvedIndex - 1 === solution.length) {
      console.log("[handleMove] Puzzle finished. Deciding outcome...");

      if (hintUsed) {
        console.log("[handleMove] Hint was used, logging as incorrect.");
        await handleIncorrectMove();
      } else {
        console.log("[handleMove] No hint used, logging as correct.");
        await handleSuccessfulPuzzle(true);
      }
    }
  };

  const showSolution = async () => {
    const chess = new Chess(fen);
    const remainingSolution = solution.slice(solvedIndex);

    for (let i = 0; i < remainingSolution.length; i++) {
      const moveUci = remainingSolution[i];
      await new Promise((resolve) => setTimeout(resolve, 600));

      chess.move({
        from: moveUci.slice(0, 2),
        to: moveUci.slice(2, 4),
        promotion: moveUci.length > 4 ? moveUci.slice(4) : undefined,
      });

      setFen(chess.fen());
    }
  };

  const handleNextPuzzle = async (forceFinish = false) => {
    console.log("[handleNextPuzzle] called. forceFinish:", forceFinish);
    const setId = getSelectedSetId();
    if (!setId) return;

    if (setIsDone(userSets, setId, currentRepeatIndex)) {
      console.log("[handleNextPuzzle] set is fully done! showing confetti.");
      showConfetti();
      return;
    }

    if (!forceFinish && !puzzleIsFinished(solution.length, solvedIndex)) {
      console.log(
        "[handleNextPuzzle] Puzzle not finished yet, returning early."
      );
      return;
    }

    let nextRepeatIndex = currentRepeatIndex;
    let nextPuzzleIndex = currentPuzzleIndex + 1;

    if (nextPuzzleIndex >= puzzleIds.length) {
      console.log(
        "[handleNextPuzzle] No more puzzles left. Starting new repeat..."
      );
      nextRepeatIndex += 1;
      nextPuzzleIndex = 0;
    }

    // Update client-side indexes
    setCurrentRepeatIndex(nextRepeatIndex);
    setCurrentPuzzleIndex(nextPuzzleIndex);

    const nextPuzzleId = puzzleIds[nextPuzzleIndex];
    const puzzle = await getPuzzleData(nextPuzzleId);

    if (!puzzle) {
      console.error(
        "[handleNextPuzzle] Failed to load puzzle with id",
        nextPuzzleId
      );
      return;
    }

    await loadPuzzleAndInitialize(
      puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    // Reset hint state for new puzzle
    setHintUsed(false);

    const chess = new Chess();
    if (puzzle.game.fen) {
      chess.load(puzzle.game.fen);
    } else {
      chess.loadPgn(puzzle.game.pgn);
    }

    setPlayerSide(chess.turn());

    await updateThisSetAccuracy(setId, setAccuracies);

    await updatePuzzleProgress(setId, nextRepeatIndex, nextPuzzleIndex);

    console.log(
      "[handleNextPuzzle] Puzzle loaded and server progress updated."
    );
  };

  const handleStartSession = async () => {
    let setId = getSelectedSetId();

    // ⏳ Wait until selectedSetId is available
    if (!setId) {
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setId = getSelectedSetId();
        if (setId) break;
      }
    }

    if (!setId) {
      console.log(
        "⚠️ [handleStartSession] No selectedSetId after waiting. Exiting early."
      );
      return;
    }

    setIsSessionActive(true);
  };

  return {
    isSessionActive,
    handleIncorrectMove,
    handleSuccessfulPuzzle,
    handleMove,
    handleNextPuzzle,
    handleStartSession,
    setHintUsed,
  };
}
