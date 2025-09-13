"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { showConfetti, showGreenCheck, showRedX, showYellowWarning } from "@/lib/visuals";
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

import { incrementCorrect, incrementIncorrect } from "@/lib/api/dailyStatsApi";

import {
  incrementUserCorrect,
  incrementUserIncorrect,
} from "@/lib/api/userStatsApi";

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
  email, // ← ✅ add email
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
  email: string | null;
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);

  const handleIncorrectMove = async () => {
    const setId = getSelectedSetId();
    if (!setId) return;
    showRedX();
    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex);

    incrementIncorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserIncorrect(email); //user stats

    await showSolution();
    
    // Wait 3 seconds after solution replay before showing feedback buttons
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setShowFeedbackButtons(true);
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    const setId = getSelectedSetId();
    if (!setId) {
      return;
    }

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex);
    incrementCorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserCorrect(email); //user stats

    await handleNextPuzzle(forceFinish);
  };

  const handleHintAssistedSolve = async () => {
    const setId = getSelectedSetId();
    if (!setId) return;
    
    // Show yellow warning instead of red X
    showYellowWarning();
    
    // Still mark as incorrect for stats (maintains current scoring logic)
    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex);

    incrementIncorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserIncorrect(email); //user stats

    // Show solution like incorrect moves do
    await showSolution();
    
    // Wait 3 seconds after solution replay before showing feedback buttons
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setShowFeedbackButtons(true);
  };

  const handleMove = async (move: string, isCorrect: boolean) => {
    if (!isSessionActive) {
      return;
    }

    if (!isCorrect) {
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

      if (hintUsed) {
        await handleHintAssistedSolve();
      } else {
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

  const showFullSolution = async (startingFen: string) => {
    const chess = new Chess(startingFen);

    const moveSpeed = 1200; // milliseconds per move
    
    // Play all solution moves from the beginning
    for (let i = 0; i < solution.length; i++) {
      const moveUci = solution[i];
      await new Promise((resolve) => setTimeout(resolve, moveSpeed));

      chess.move({
        from: moveUci.slice(0, 2),
        to: moveUci.slice(2, 4),
        promotion: moveUci.length > 4 ? moveUci.slice(4) : undefined,
      });

      setFen(chess.fen());
    }
  };

  const handleNextPuzzle = async (forceFinish = false) => {
    const setId = getSelectedSetId();
    if (!setId) return;

    if (setIsDone(userSets, setId, currentRepeatIndex)) {
      showConfetti();
      return;
    }

    if (!forceFinish && !puzzleIsFinished(solution.length, solvedIndex)) {
      return;
    }

    let nextRepeatIndex = currentRepeatIndex;
    let nextPuzzleIndex = currentPuzzleIndex + 1;

    if (nextPuzzleIndex >= puzzleIds.length) {
      nextRepeatIndex += 1;
      nextPuzzleIndex = 0;
    }

    // Update client-side indexes
    setCurrentRepeatIndex(nextRepeatIndex);
    setCurrentPuzzleIndex(nextPuzzleIndex);

    const nextPuzzleId = puzzleIds[nextPuzzleIndex];
    const puzzle = await getPuzzleData(nextPuzzleId);

    if (!puzzle) {
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
      return;
    }

    setIsSessionActive(true);
  };

  const handleContinueToNext = async () => {
    setShowFeedbackButtons(false);
    await handleNextPuzzle(true);
  };

  const handleRetryPuzzle = async () => {
    setShowFeedbackButtons(false);
    // Reset puzzle to initial state
    const setId = getSelectedSetId();
    if (!setId) return;
    
    const nextPuzzleId = puzzleIds[currentPuzzleIndex];
    const puzzle = await getPuzzleData(nextPuzzleId);
    
    if (!puzzle) {
      return;
    }

    await loadPuzzleAndInitialize(
      puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );
    
    // Reset hint state
    setHintUsed(false);
  };

  const handleShowReplay = async () => {
    setShowFeedbackButtons(false);
    
    // Get the current puzzle data to reset to initial position
    const setId = getSelectedSetId();
    if (!setId) return;
    
    const currentPuzzleId = puzzleIds[currentPuzzleIndex];
    const puzzle = await getPuzzleData(currentPuzzleId);
    
    if (!puzzle) {
      return;
    }

    // Reset to initial position and capture starting FEN
    await loadPuzzleAndInitialize(
      puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );
    
    // Get the starting FEN for the full replay
    const chess = new Chess();
    let startingFen;
    if (puzzle.game.fen) {
      chess.load(puzzle.game.fen);
      startingFen = puzzle.game.fen;
    } else {
      chess.loadPgn(puzzle.game.pgn);
      startingFen = chess.fen();
    }
    
    // Small delay before starting replay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Show the full solution from the beginning
    await showFullSolution(startingFen);

    //wait for 1 second
    const postReplayDelay = 2000; // milliseconds
    await new Promise((resolve) => setTimeout(resolve, postReplayDelay));

    // After replay, show feedback buttons again
    setShowFeedbackButtons(true);
  };

  return {
    isSessionActive,
    handleIncorrectMove,
    handleSuccessfulPuzzle,
    handleMove,
    handleNextPuzzle,
    handleStartSession,
    setHintUsed,
    showFeedbackButtons,
    handleContinueToNext,
    handleRetryPuzzle,
    handleShowReplay,
  };
}
