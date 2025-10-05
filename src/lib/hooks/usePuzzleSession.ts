"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { showConfetti, showGreenCheck, showRedX, showYellowWarning } from "@/lib/visuals";
import {
  parseUCIMove,
  puzzleIsFinished,
  setIsDone,
} from "@/lib/utils/puzzleUtils";
import { getPuzzleData } from "@/lib/api/puzzleApi";
import { ChessPeckerPuzzle } from "@/lib/types";
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
  autoShowSolution = true, // ← ✅ add autoShowSolution with default true
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
  autoShowSolution?: boolean;
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [currentPuzzleData, setCurrentPuzzleData] = useState<{ puzzle: ChessPeckerPuzzle } | null>(null);

  // Timing state for puzzle duration tracking
  const [puzzleStartTime, setPuzzleStartTime] = useState<number | null>(null);

  // One-time marking logic to prevent duplicate accuracy records
  const [puzzleAttempted, setPuzzleAttempted] = useState(false);
  const [puzzleOutcome, setPuzzleOutcome] = useState<'correct' | 'incorrect' | null>(null);
  // Track retry cycles to prevent stale state issues
  const [retryCounter, setRetryCounter] = useState(0);

  // Reset puzzle tracking when moving to a new puzzle
  useEffect(() => {
    setPuzzleAttempted(false);
    setPuzzleOutcome(null);
    setRetryCounter(0);
    setPuzzleStartTime(Date.now());
  }, [currentPuzzleIndex, currentRepeatIndex]);

  const handleIncorrectMove = async () => {
    if (puzzleAttempted) return;

    const setId = getSelectedSetId();
    if (!setId) return;

    setPuzzleAttempted(true);
    setPuzzleOutcome('incorrect');
    showRedX();

    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0;

    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex, timeTaken);

    incrementIncorrect();
    if (!email) email = "unauthenticated@email.com";
    incrementUserIncorrect(email);

    if (autoShowSolution) {
      await showSolution();
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    setShowFeedbackButtons(true);
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    if (puzzleAttempted && puzzleOutcome === 'correct' && retryCounter === 0) {
      return;
    }

    const setId = getSelectedSetId();
    if (!setId) return;

    setPuzzleAttempted(true);
    setPuzzleOutcome('correct');

    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0;

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex, timeTaken);
    incrementCorrect();
    if (!email) email = "unauthenticated@email.com";
    incrementUserCorrect(email);

    await handleNextPuzzle(true);
  };

  const handleHintAssistedSolve = async () => {
    // Only mark once per puzzle
    if (puzzleAttempted) return;

    const setId = getSelectedSetId();
    if (!setId) return;

    setPuzzleAttempted(true);
    setPuzzleOutcome('correct');

    // Show yellow warning instead of red X
    showYellowWarning();

    // Calculate elapsed time
    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0; // Convert to seconds

    // Mark as correct for stats (hints should count as correct)
    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex, timeTaken);

    incrementCorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserCorrect(email); //user stats

    // Show solution like incorrect moves do
    await showSolution();

    // Wait 3 seconds after solution replay before showing feedback buttons
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setShowFeedbackButtons(true);
  };

  const handleMove = async (move: string, isCorrect: boolean) => {
    if (!isSessionActive) return;

    if (!isCorrect) {
      await handleIncorrectMove();
      return;
    }

    showGreenCheck();
    setHighlight(null);

    const newSolvedIndex = solvedIndex + 2;
    setSolvedIndex(newSolvedIndex);

    if (newSolvedIndex >= solution.length) {
      if (hintUsed) {
        try {
          await handleHintAssistedSolve();
        } catch (error) {
          console.error('Error in handleHintAssistedSolve:', error);
          setShowFeedbackButtons(true);
        }
      } else {
        try {
          await handleSuccessfulPuzzle(true);
        } catch (error) {
          console.error('Error in handleSuccessfulPuzzle:', error);
          await handleNextPuzzle(true);
        }
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
    const puzzleData = await getPuzzleData(nextPuzzleId);
    setCurrentPuzzleData(puzzleData);

    if (!puzzleData) {
      return;
    }

    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    // Reset hint state for new puzzle
    setHintUsed(false);

    const chess = new Chess(puzzleData.puzzle.FEN);
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
    setPuzzleStartTime(Date.now());
  };

  const handleContinueToNext = async () => {
    setShowFeedbackButtons(false);
    await handleNextPuzzle(true);
  };

  const handleRetryPuzzle = async () => {
    setShowFeedbackButtons(false);
    setPuzzleAttempted(false);
    setPuzzleOutcome(null);
    setRetryCounter(prev => prev + 1);

    const setId = getSelectedSetId();
    if (!setId) return;

    const nextPuzzleId = puzzleIds[currentPuzzleIndex];
    const puzzleData = await getPuzzleData(nextPuzzleId);
    setCurrentPuzzleData(puzzleData);

    if (!puzzleData) return;

    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    setHintUsed(false);
    setPuzzleStartTime(Date.now());
  };

  const handleManualShowSolution = async () => {
    setShowFeedbackButtons(false);
    await showSolution();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setShowFeedbackButtons(true);
  };

  const handleShowReplay = async () => {
    setShowFeedbackButtons(false);

    // Get the current puzzle data to reset to initial position
    const setId = getSelectedSetId();
    if (!setId) return;

    const currentPuzzleId = puzzleIds[currentPuzzleIndex];
    const puzzleData = await getPuzzleData(currentPuzzleId);
    setCurrentPuzzleData(puzzleData);

    if (!puzzleData) {
      return;
    }

    // Reset to initial position and capture starting FEN
    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );

    // Get the starting FEN for the full replay
    const startingFen = puzzleData.puzzle.FEN;

    // Small delay before starting replay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Show the full solution from the beginning
    await showFullSolution(startingFen);

    //wait for 1 second
    const postReplayDelay = 1000; // milliseconds
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
    handleManualShowSolution,
    currentPuzzleData,
  };
}
