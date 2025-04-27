// src/lib/hooks/usePuzzleSession.ts

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
} from "@/lib/hooks/usePuzzleData";

export function usePuzzleSession({
  selectedSetId,
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
  setPlayerSide, // 🛠 ADD THIS
}: {
  selectedSetId: number | null;
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
  setPlayerSide: (side: "w" | "b") => void; // 🛠 ADD THIS
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleIncorrectMove = async () => {
    if (!selectedSetId) return;
    showRedX();
    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(selectedSetId, currentRepeatIndex);

    await showSolution();
    console.log("This puzzle was unsuccessful!");
    await handleNextPuzzle(true);
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    console.log(
      "[handleSuccessfulPuzzle] called!",
      "forceFinish:",
      forceFinish
    );

    if (!selectedSetId) {
      console.log(
        "[handleSuccessfulPuzzle] no selectedSetId, returning early."
      );
      return;
    }

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(selectedSetId, currentRepeatIndex);
    console.log("[handleSuccessfulPuzzle] recorded correct attempt.");

    await handleNextPuzzle(forceFinish);
  };

  const handleMove = async (move: string, isCorrect: boolean) => {
    console.log(
      "[handleMove] called with move:",
      move,
      "isCorrect:",
      isCorrect
    );

    if (!isSessionActive) {
      console.log("[handleMove] session not active, returning early.");
      return;
    }

    if (!isCorrect) {
      console.log(
        "[handleMove] move incorrect, calling handleIncorrectMove..."
      );
      await handleIncorrectMove();
      return;
    }

    showGreenCheck();

    const newSolvedIndex = solvedIndex + 2;
    console.log(
      "[handleMove] setting newSolvedIndex to",
      newSolvedIndex,
      "(old solvedIndex:",
      solvedIndex,
      ")"
    );

    setSolvedIndex(newSolvedIndex);

    const chess = new Chess();
    chess.load(fen);

    chess.move(parseUCIMove(solution[solvedIndex]));

    const computerMove = solution[solvedIndex + 1];
    if (computerMove) {
      chess.move(parseUCIMove(computerMove));
    }

    const newFen = chess.fen();
    console.log("[handleMove] new FEN after moves:", newFen);
    setFen(newFen);

    if (newSolvedIndex - 1 === solution.length) {
      console.log(
        "[handleMove] detected puzzle finished! calling handleSuccessfulPuzzle..."
      );
      await handleSuccessfulPuzzle(true);
    } else {
      console.log(
        "[handleMove] puzzle not finished yet. newSolvedIndex-1 =",
        newSolvedIndex - 1,
        "solution.length =",
        solution.length
      );
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

    if (!selectedSetId) return;

    if (setIsDone(userSets, selectedSetId, currentRepeatIndex)) {
      console.log("[handleNextPuzzle] set is fully done! showing confetti.");
      showConfetti();
      return;
    }

    if (!forceFinish) {
      console.log(
        "[handleNextPuzzle] Checking if puzzle is finished... (solvedIndex:",
        solvedIndex,
        "solution.length:",
        solution.length,
        ")"
      );
      if (!puzzleIsFinished(solution.length, solvedIndex)) {
        console.log(
          "[handleNextPuzzle] Puzzle not finished yet, returning early."
        );
        return;
      }
    }

    const nextPuzzleIndex = currentPuzzleIndex + 1;
    console.log(
      "[handleNextPuzzle] Advancing to nextPuzzleIndex:",
      nextPuzzleIndex,
      "(currentPuzzleIndex was:",
      currentPuzzleIndex,
      ")"
    );

    if (nextPuzzleIndex >= puzzleIds.length) {
      console.log(
        "[handleNextPuzzle] No more puzzles left. Starting new repeat..."
      );

      const { setSetProgress } = await import("@/lib/api/puzzleApi");

      const newRepeatIndex = currentRepeatIndex + 1;
      const newPuzzleIndex = 0;

      await setSetProgress(selectedSetId, newRepeatIndex, newPuzzleIndex);

      setCurrentRepeatIndex(newRepeatIndex);
      setCurrentPuzzleIndex(newPuzzleIndex);

      console.log(
        "[handleNextPuzzle] Repeat incremented. Now repeat:",
        newRepeatIndex,
        "Puzzle index:",
        newPuzzleIndex
      );

      const firstPuzzleId = puzzleIds[0];
      const puzzle = await getPuzzleData(firstPuzzleId);

      if (puzzle) {
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
        console.log(
          "[handleNextPuzzle] Loaded new puzzle after repeat increment. Turn:",
          turn
        );
        setPlayerSide(turn);

        await updateThisSetAccuracy(selectedSetId, setAccuracies);
      } else {
        console.error(
          "[handleNextPuzzle] Failed to load first puzzle after repeat increment!"
        );
      }

      return;
    }

    const nextPuzzleId = puzzleIds[nextPuzzleIndex];
    console.log("[handleNextPuzzle] Loading next puzzle ID:", nextPuzzleId);

    const puzzle = await getPuzzleData(nextPuzzleId);

    if (puzzle) {
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
      console.log("[handleNextPuzzle] Loaded new puzzle. Turn:", turn);
      setPlayerSide(turn);

      setCurrentPuzzleIndex(nextPuzzleIndex);
      console.log(
        "[handleNextPuzzle] Puzzle loaded and currentPuzzleIndex set to",
        nextPuzzleIndex
      );

      await updateThisSetAccuracy(selectedSetId, setAccuracies);
      console.log("[handleNextPuzzle] Accuracy updated.");
    } else {
      console.warn(
        "[handleNextPuzzle] Failed to load puzzle with id",
        nextPuzzleId
      );
    }
  };

  const handleStartSession = async () => {
    console.log("➡️ [handleStartSession] START");

    setIsSessionActive(true);
    if (!selectedSetId) {
      console.log("⚠️ [handleStartSession] No selectedSetId. Exiting early.");
      return;
    }

    const { updatePuzzleProgress } = await import("@/lib/hooks/usePuzzleData");
    await updatePuzzleProgress(
      selectedSetId,
      setCurrentRepeatIndex,
      setCurrentPuzzleIndex
    );

    console.log("✅ [handleStartSession] END");
  };


  return {
    isSessionActive,
    handleIncorrectMove,
    handleSuccessfulPuzzle,
    handleMove,
    handleNextPuzzle,
    handleStartSession,
  };
}
