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

  // Debug logs for state changes
  useEffect(() => {
    console.log('🔴 [RETRY DEBUG] showFeedbackButtons changed to:', showFeedbackButtons);
  }, [showFeedbackButtons]);

  useEffect(() => {
    console.log('🔵 [RETRY DEBUG] isSessionActive changed to:', isSessionActive);
  }, [isSessionActive]);

  useEffect(() => {
    console.log('🟡 [RETRY DEBUG] puzzleAttempted changed to:', puzzleAttempted);
  }, [puzzleAttempted]);

  useEffect(() => {
    console.log('🟠 [RETRY DEBUG] puzzleOutcome changed to:', puzzleOutcome);
  }, [puzzleOutcome]);

  useEffect(() => {
    console.log('🟢 [RETRY DEBUG] fen changed to:', fen.slice(0, 50) + '...');
  }, [fen]);

  useEffect(() => {
    console.log('🟣 [RETRY DEBUG] solution changed to:', solution);
  }, [solution]);

  useEffect(() => {
    console.log('🟤 [RETRY DEBUG] solvedIndex changed to:', solvedIndex);
  }, [solvedIndex]);

  // Reset puzzle tracking when moving to a new puzzle
  useEffect(() => {
    console.log('🔄 [RETRY DEBUG] useEffect - Resetting puzzle tracking');
    console.log('🔄 [RETRY DEBUG] currentPuzzleIndex changed to:', currentPuzzleIndex);
    console.log('🔄 [RETRY DEBUG] currentRepeatIndex changed to:', currentRepeatIndex);
    console.log('🔄 [RETRY DEBUG] Resetting puzzleAttempted to false and puzzleOutcome to null');
    setPuzzleAttempted(false);
    setPuzzleOutcome(null);
    setRetryCounter(0); // Reset retry counter for new puzzle
    // Start timing for new puzzle
    setPuzzleStartTime(Date.now());
  }, [currentPuzzleIndex, currentRepeatIndex]);

  const handleIncorrectMove = async () => {
    console.log('🚨 [RETRY DEBUG] handleIncorrectMove - START');
    console.log('🚨 [RETRY DEBUG] puzzleAttempted:', puzzleAttempted);
    console.log('🚨 [RETRY DEBUG] currentPuzzleIndex:', currentPuzzleIndex);
    console.log('🚨 [RETRY DEBUG] currentRepeatIndex:', currentRepeatIndex);

    // Only mark as incorrect once per puzzle
    if (puzzleAttempted) {
      console.log('🚨 [RETRY DEBUG] Puzzle already attempted, returning early');
      return;
    }

    const setId = getSelectedSetId();
    console.log('🚨 [RETRY DEBUG] setId:', setId);
    if (!setId) {
      console.log('🚨 [RETRY DEBUG] No setId found, returning');
      return;
    }

    console.log('🚨 [RETRY DEBUG] Setting puzzle as attempted and incorrect');
    setPuzzleAttempted(true);
    setPuzzleOutcome('incorrect');

    console.log('🚨 [RETRY DEBUG] Showing red X visual feedback');
    showRedX();

    // Calculate elapsed time
    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0; // Convert to seconds

    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    console.log('🚨 [RETRY DEBUG] Adding incorrect attempt to database');
    await addIncorrectAttempt(setId, currentRepeatIndex, timeTaken);

    console.log('🚨 [RETRY DEBUG] Incrementing stats');
    incrementIncorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserIncorrect(email); //user stats

    if (autoShowSolution) {
      console.log('🚨 [RETRY DEBUG] Starting solution replay');
      await showSolution();
      console.log('🚨 [RETRY DEBUG] Solution replay completed');

      // Wait 3 seconds after solution replay before showing feedback buttons
      console.log('🚨 [RETRY DEBUG] Waiting 3 seconds before showing feedback buttons');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      console.log('🚨 [RETRY DEBUG] Auto show solution disabled, showing feedback buttons immediately');
    }

    console.log('🚨 [RETRY DEBUG] Showing feedback buttons');
    setShowFeedbackButtons(true);
    console.log('🚨 [RETRY DEBUG] handleIncorrectMove - END');
  };

  const handleSuccessfulPuzzle = async (forceFinish = false) => {
    console.log('✅ [RETRY DEBUG] handleSuccessfulPuzzle - START');
    console.log('✅ [RETRY DEBUG] puzzleAttempted:', puzzleAttempted, 'puzzleOutcome:', puzzleOutcome, 'retryCounter:', retryCounter);

    // More specific guards: only prevent if this puzzle was already marked as correct in this attempt cycle
    // Don't block completion after a retry (retryCounter > 0 means we've retried)
    if (puzzleAttempted && puzzleOutcome === 'correct' && retryCounter === 0) {
      console.log('✅ [RETRY DEBUG] Puzzle already completed in this cycle, returning early');
      return;
    }

    // Allow successful completion even if previously failed, since user might retry
    console.log('✅ [RETRY DEBUG] Proceeding with puzzle completion');

    const setId = getSelectedSetId();
    if (!setId) {
      return;
    }

    setPuzzleAttempted(true);
    setPuzzleOutcome('correct');

    // Calculate elapsed time
    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0; // Convert to seconds

    const { addCorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addCorrectAttempt(setId, currentRepeatIndex, timeTaken);
    incrementCorrect(); //total daily stats
    if (!email) email = "unauthenticated@email.com";
    incrementUserCorrect(email); //user stats

    console.log('✅ [RETRY DEBUG] Calling handleNextPuzzle with forceFinish:', forceFinish);
    await handleNextPuzzle(forceFinish);
    console.log('✅ [RETRY DEBUG] handleSuccessfulPuzzle - END');
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
    console.log('🎯 [RETRY DEBUG] handleMove - START');
    console.log('🎯 [RETRY DEBUG] move:', move, 'isCorrect:', isCorrect);
    console.log('🎯 [RETRY DEBUG] isSessionActive:', isSessionActive);
    console.log('🎯 [RETRY DEBUG] puzzleAttempted:', puzzleAttempted);
    console.log('🎯 [RETRY DEBUG] puzzleOutcome:', puzzleOutcome);
    console.log('🎯 [RETRY DEBUG] currentPuzzleIndex:', currentPuzzleIndex);
    console.log('🎯 [RETRY DEBUG] solvedIndex:', solvedIndex);
    console.log('🎯 [RETRY DEBUG] solution.length:', solution.length);

    if (!isSessionActive) {
      console.log('🎯 [RETRY DEBUG] Session not active, returning early');
      return;
    }

    if (!isCorrect) {
      console.log('🎯 [RETRY DEBUG] Incorrect move, calling handleIncorrectMove');
      await handleIncorrectMove();
      console.log('🎯 [RETRY DEBUG] handleIncorrectMove completed');
      return;
    }

    // Correct move played
    console.log('🎯 [RETRY DEBUG] Correct move played');
    showGreenCheck();
    setHighlight(null);

    const newSolvedIndex = solvedIndex + 2;
    console.log('🎯 [RETRY DEBUG] Updating solvedIndex from', solvedIndex, 'to', newSolvedIndex);
    setSolvedIndex(newSolvedIndex);

    const chess = new Chess();
    chess.load(fen);
    console.log('🎯 [RETRY DEBUG] Making player move:', solution[solvedIndex]);
    chess.move(parseUCIMove(solution[solvedIndex]));

    const computerMove = solution[solvedIndex + 1];
    if (computerMove) {
      console.log('🎯 [RETRY DEBUG] Making computer move:', computerMove);
      chess.move(parseUCIMove(computerMove));
    }

    const newFen = chess.fen();
    console.log('🎯 [RETRY DEBUG] Updating FEN to:', newFen);
    setFen(newFen);

    console.log('🎯 [RETRY DEBUG] Checking if puzzle complete:', newSolvedIndex - 1, '===', solution.length);
    if (newSolvedIndex - 1 === solution.length) {
      console.log('🎯 [RETRY DEBUG] Puzzle completed!');
      if (hintUsed) {
        console.log('🎯 [RETRY DEBUG] Hint was used, calling handleHintAssistedSolve');
        try {
          await handleHintAssistedSolve();
        } catch (error) {
          console.error('🚨 [RETRY DEBUG] Error in handleHintAssistedSolve, showing feedback buttons:', error);
          setShowFeedbackButtons(true);
        }
      } else {
        console.log('🎯 [RETRY DEBUG] No hint used, calling handleSuccessfulPuzzle');
        try {
          await handleSuccessfulPuzzle(true);
        } catch (error) {
          console.error('🚨 [RETRY DEBUG] Error in handleSuccessfulPuzzle, forcing progression:', error);
          // Defensive fallback: force progression even if handleSuccessfulPuzzle fails
          await handleNextPuzzle(true);
        }
      }
    }
    console.log('🎯 [RETRY DEBUG] handleMove - END');
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
    console.log('🚀 [RETRY DEBUG] handleNextPuzzle - START, forceFinish:', forceFinish);
    const setId = getSelectedSetId();
    if (!setId) {
      console.log('🚀 [RETRY DEBUG] No setId, returning early');
      return;
    }

    if (setIsDone(userSets, setId, currentRepeatIndex)) {
      console.log('🚀 [RETRY DEBUG] Set is done, showing confetti');
      showConfetti();
      return;
    }

    if (!forceFinish && !puzzleIsFinished(solution.length, solvedIndex)) {
      console.log('🚀 [RETRY DEBUG] Puzzle not finished and not forcing, returning');
      return;
    }

    console.log('🚀 [RETRY DEBUG] Proceeding with next puzzle logic');

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
    console.log('🚀 [RETRY DEBUG] handleStartSession - START');
    let setId = getSelectedSetId();
    console.log('🚀 [RETRY DEBUG] Initial setId:', setId);

    // ⏳ Wait until selectedSetId is available
    if (!setId) {
      console.log('🚀 [RETRY DEBUG] No setId, waiting for it...');
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setId = getSelectedSetId();
        console.log('🚀 [RETRY DEBUG] Attempt', attempt + 1, 'setId:', setId);
        if (setId) break;
      }
    }

    if (!setId) {
      console.log('🚀 [RETRY DEBUG] No setId found after waiting, returning');
      return;
    }

    console.log('🚀 [RETRY DEBUG] Setting session active with setId:', setId);
    setIsSessionActive(true);
    // Start timing for the first puzzle
    setPuzzleStartTime(Date.now());
    console.log('🚀 [RETRY DEBUG] handleStartSession - END');
  };

  const handleContinueToNext = async () => {
    setShowFeedbackButtons(false);
    await handleNextPuzzle(true);
  };

  const handleRetryPuzzle = async () => {
    console.log('🔄 [RETRY DEBUG] handleRetryPuzzle - START');
    console.log('🔄 [RETRY DEBUG] Current state before retry:');
    console.log('🔄 [RETRY DEBUG] - currentPuzzleIndex:', currentPuzzleIndex);
    console.log('🔄 [RETRY DEBUG] - currentRepeatIndex:', currentRepeatIndex);
    console.log('🔄 [RETRY DEBUG] - puzzleAttempted:', puzzleAttempted);
    console.log('🔄 [RETRY DEBUG] - puzzleOutcome:', puzzleOutcome);
    console.log('🔄 [RETRY DEBUG] - isSessionActive:', isSessionActive);
    console.log('🔄 [RETRY DEBUG] - showFeedbackButtons:', showFeedbackButtons);
    console.log('🔄 [RETRY DEBUG] - puzzleIds.length:', puzzleIds.length);

    console.log('🔄 [RETRY DEBUG] Hiding feedback buttons');
    setShowFeedbackButtons(false);

    // CRITICAL: Reset puzzle tracking state FIRST before any async operations
    console.log('🔄 [RETRY DEBUG] Resetting puzzle attempt tracking IMMEDIATELY');
    setPuzzleAttempted(false);
    setPuzzleOutcome(null);
    setRetryCounter(prev => prev + 1); // Increment retry counter
    console.log('🔄 [RETRY DEBUG] State reset complete - puzzleAttempted: false, puzzleOutcome: null');

    // Reset puzzle to initial state
    const setId = getSelectedSetId();
    console.log('🔄 [RETRY DEBUG] setId:', setId);
    if (!setId) {
      console.log('🔄 [RETRY DEBUG] No setId found, returning early');
      return;
    }

    const nextPuzzleId = puzzleIds[currentPuzzleIndex];
    console.log('🔄 [RETRY DEBUG] Getting puzzle data for ID:', nextPuzzleId);
    console.log('🔄 [RETRY DEBUG] currentPuzzleIndex:', currentPuzzleIndex);
    const puzzleData = await getPuzzleData(nextPuzzleId);
    console.log('🔄 [RETRY DEBUG] Retrieved puzzle data:', puzzleData ? 'SUCCESS' : 'FAILED');
    if (puzzleData) {
      console.log('🔄 [RETRY DEBUG] Puzzle details:', {
        id: puzzleData.puzzle.PuzzleId,
        themes: puzzleData.puzzle.Themes,
        rating: puzzleData.puzzle.Rating,
      });
    }
    setCurrentPuzzleData(puzzleData);

    if (!puzzleData) {
      console.log('🔄 [RETRY DEBUG] No puzzle data received, returning');
      return;
    }

    console.log('🔄 [RETRY DEBUG] Calling loadPuzzleAndInitialize');
    await loadPuzzleAndInitialize(
      puzzleData.puzzle,
      setFen,
      setSolution,
      setSolvedIndex,
      setHighlight
    );
    console.log('🔄 [RETRY DEBUG] loadPuzzleAndInitialize completed');

    // Reset hint state
    console.log('🔄 [RETRY DEBUG] Resetting hint state');
    setHintUsed(false);

    // Restart puzzle timing
    setPuzzleStartTime(Date.now());

    console.log('🔄 [RETRY DEBUG] handleRetryPuzzle - END');
    console.log('🔄 [RETRY DEBUG] Final state:');
    console.log('🔄 [RETRY DEBUG] - isSessionActive should still be:', isSessionActive);
    console.log('🔄 [RETRY DEBUG] - showFeedbackButtons should be:', false);
    console.log('🔄 [RETRY DEBUG] - retryCounter incremented to indicate fresh attempt');
  };

  const handleManualShowSolution = async () => {
    console.log('🔍 [SOLUTION DEBUG] handleManualShowSolution - START');

    // Hide feedback buttons during solution display
    setShowFeedbackButtons(false);

    console.log('🔍 [SOLUTION DEBUG] Starting solution replay');
    await showSolution();
    console.log('🔍 [SOLUTION DEBUG] Solution replay completed');

    // Wait 3 seconds after solution replay before showing feedback buttons
    console.log('🔍 [SOLUTION DEBUG] Waiting 3 seconds before showing feedback buttons');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('🔍 [SOLUTION DEBUG] Showing feedback buttons');
    setShowFeedbackButtons(true);
    console.log('🔍 [SOLUTION DEBUG] handleManualShowSolution - END');
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
