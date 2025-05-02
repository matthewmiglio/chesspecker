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

  const [moveHistory, setMoveHistory] = useState<string[]>([fen]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const isReviewing = currentMoveIndex < moveHistory.length - 1;

  const goBack = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex((i) => i - 1);
      setFen(moveHistory[currentMoveIndex - 1]);
    }
  };

  const goForward = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      setCurrentMoveIndex((i) => i + 1);
      setFen(moveHistory[currentMoveIndex + 1]);
    }
  };

  const goToFront = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const lastFen = moveHistory[moveHistory.length - 1];
      setCurrentMoveIndex(moveHistory.length - 1);
      setFen(lastFen);
    }
  };

  const handleIncorrectMove = async () => {
    const setId = getSelectedSetId();
    if (!setId) return;
    showRedX();
    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex);

    await showSolution();
    await handleNextPuzzle(true);
  };

  const handleMove = async (move: string, isCorrect: boolean) => {
    if (!isSessionActive || isReviewing) return;

    if (!isCorrect) {
      await handleIncorrectMove();
      return;
    }

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

    const updatedHistory = [...moveHistory.slice(0, currentMoveIndex + 1), newFen];
    setMoveHistory(updatedHistory);
    setCurrentMoveIndex(updatedHistory.length - 1);

    setFen(newFen);

    if (newSolvedIndex - 1 === solution.length) {
      if (hintUsed) {
        await handleIncorrectMove();
      } else {
        await handleSuccessfulPuzzle(true);
      }
    }
  };

  const showSolution = async () => {
    const chess = new Chess(fen);
    const remainingSolution = solution.slice(solvedIndex);

    for (let i = 0; i < remainingSolution.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      chess.move(parseUCIMove(remainingSolution[i]));
      const newFen = chess.fen();

      setFen(newFen);
    }
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    const setId = getSelectedSetId();
    if (!setId) return;

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex);

    await handleNextPuzzle(forceFinish);
  };

  const handleNextPuzzle = async (forceFinish = false) => {
    const setId = getSelectedSetId();
    if (!setId) return;

    if (setIsDone(userSets, setId, currentRepeatIndex)) {
      showConfetti();
      return;
    }

    if (!forceFinish && !puzzleIsFinished(solution.length, solvedIndex)) return;

    let nextRepeatIndex = currentRepeatIndex;
    let nextPuzzleIndex = currentPuzzleIndex + 1;

    if (nextPuzzleIndex >= puzzleIds.length) {
      nextRepeatIndex += 1;
      nextPuzzleIndex = 0;
    }

    setCurrentRepeatIndex(nextRepeatIndex);
    setCurrentPuzzleIndex(nextPuzzleIndex);

    const nextPuzzleId = puzzleIds[nextPuzzleIndex];
    const puzzle = await getPuzzleData(nextPuzzleId);
    if (!puzzle) return;

    await loadPuzzleAndInitialize(
      puzzle,
      (f) => {
        setFen(f);
        setMoveHistory([f]);
        setCurrentMoveIndex(0);
      },
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    setHintUsed(false);

    const chess = new Chess();
    puzzle.game.fen ? chess.load(puzzle.game.fen) : chess.loadPgn(puzzle.game.pgn);
    setPlayerSide(chess.turn());

    await updateThisSetAccuracy(setId, setAccuracies);
    await updatePuzzleProgress(setId, nextRepeatIndex, nextPuzzleIndex);
  };

  const handleStartSession = async () => {
    let setId = getSelectedSetId();
    if (!setId) {
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setId = getSelectedSetId();
        if (setId) break;
      }
    }

    if (!setId) return;

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
    goBack,
    goForward,
    goToFront,
    currentMoveIndex,
    moveHistory,
  };
}
