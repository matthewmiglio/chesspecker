"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { showConfetti, showGreenCheck, showRedX, showYellowWarning } from "@/lib/visuals";
import {
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

import { bumpDailyUsage } from "@/lib/api/usageApi";

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
  autoShowSolution = true,
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
  autoShowSolution?: boolean;
}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [currentPuzzleData, setCurrentPuzzleData] = useState<{ puzzle: ChessPeckerPuzzle } | null>(null);
  const [autoNextPuzzle, setAutoNextPuzzle] = useState(false);

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
    console.log('[handleIncorrectMove] Called');
    if (puzzleAttempted) {
      console.log('[handleIncorrectMove] Puzzle already attempted, skipping');
      return;
    }

    console.log('[handleIncorrectMove] Auto show solution:', autoShowSolution);
    console.log('[handleIncorrectMove] Auto next puzzle:', autoNextPuzzle);

    const setId = getSelectedSetId();
    if (!setId) {
      console.warn('[handleIncorrectMove] No set ID, aborting');
      return;
    }

    setPuzzleAttempted(true);
    setPuzzleOutcome('incorrect');
    showRedX();

    const timeTaken = puzzleStartTime ? (Date.now() - puzzleStartTime) / 1000 : 0;
    console.log('[handleIncorrectMove] Time taken:', timeTaken, 'seconds');

    const { addIncorrectAttempt } = await import("@/lib/api/puzzleApi");
    await addIncorrectAttempt(setId, currentRepeatIndex, timeTaken);

    bumpDailyUsage({ incorrect_puzzles: 1 });
    incrementUserIncorrect();

    // if auto show solution on and + auto next on -> shows solution, waits a sec, then moves to next puzzle without input
    if (autoShowSolution && autoNextPuzzle) {
      console.log('[handleIncorrectMove] Path: Show solution + auto next');
      await showSolution();
      console.log('[handleIncorrectMove] Solution shown, waiting 3s before next puzzle');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await handleNextPuzzle(true);
      return;
    }

    // if auto show solution off and + auto next on -> skips showing solution, just moves to next puzzle immediately no input
    if (!autoShowSolution && autoNextPuzzle) {
      console.log('[handleIncorrectMove] Path: Skip solution + auto next');
      await handleNextPuzzle(true);
      return;
    }

    // if auto show solution on and + auto next off ->  shows solution, waits a sec, then shows continue replay export popup
    if (autoShowSolution && !autoNextPuzzle) {
      console.log('[handleIncorrectMove] Path: Show solution + show feedback buttons');
      await showSolution();
      console.log('[handleIncorrectMove] Solution shown, waiting 3s before showing buttons');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setShowFeedbackButtons(true);
      return;
    }

    // if auto show solution off and + auto next off -> skips showing solution, then goes right to the popup for showing continue replay and export
    if (!autoShowSolution && !autoNextPuzzle) {
      console.log('[handleIncorrectMove] Path: Skip solution + show feedback buttons');
      setShowFeedbackButtons(true);
      return;
    }

    console.warn('[handleIncorrectMove] No path matched - this should not happen');
  };

  const handleSuccessfulPuzzle = async () => {
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
    bumpDailyUsage({ correct_puzzles: 1 });
    incrementUserCorrect();

    // if they get it right
    // -if auto show solution on and + auto next on -> auto move to next puzzle immediately, no popup no solution.
    // -if auto show solution off and + auto next on -> auto move to next puzzle immediately, no popup no solution.
    if (autoNextPuzzle) {
      await handleNextPuzzle(true);
      return;
    }

    // -if auto show solution on and + auto next off -> popup for replay and export and continue shows
    // -if auto show solution off and + auto next off -> popup for replay and export and continue shows
    if (!autoNextPuzzle) {
      setShowFeedbackButtons(true);
      return;
    }
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

    bumpDailyUsage({ correct_puzzles: 1 }); //total daily stats
    incrementUserCorrect(); //user stats

    // Hint-assisted counts as correct, so follow the correct answer logic
    // -if auto next on -> auto move to next puzzle immediately
    if (autoNextPuzzle) {
      await handleNextPuzzle(true);
      return;
    }

    // -if auto next off -> popup for replay and export and continue shows
    if (!autoNextPuzzle) {
      setShowFeedbackButtons(true);
      return;
    }
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
          await handleSuccessfulPuzzle();
        } catch (error) {
          console.error('Error in handleSuccessfulPuzzle:', error);
          await handleNextPuzzle(true);
        }
      }
    }
  };

  const showSolution = async () => {
    console.log('[showSolution] Starting solution replay');
    console.log('[showSolution] Current FEN:', fen);
    console.log('[showSolution] Full solution:', solution);
    console.log('[showSolution] Solved index:', solvedIndex);

    const chess = new Chess(fen);
    const remainingSolution = solution.slice(solvedIndex);

    console.log('[showSolution] Remaining moves to play:', remainingSolution);
    console.log('[showSolution] Total moves to play:', remainingSolution.length);

    for (let i = 0; i < remainingSolution.length; i++) {
      const moveUci = remainingSolution[i];
      console.log(`[showSolution] Move ${i + 1}/${remainingSolution.length}: "${moveUci}"`);
      console.log(`[showSolution] Current FEN before move: ${chess.fen()}`);
      console.log(`[showSolution] Parsing move - from: "${moveUci.slice(0, 2)}", to: "${moveUci.slice(2, 4)}", promotion: "${moveUci.length > 4 ? moveUci.slice(4) : 'none'}"`);

      await new Promise((resolve) => setTimeout(resolve, 600));

      try {
        const moveResult = chess.move({
          from: moveUci.slice(0, 2),
          to: moveUci.slice(2, 4),
          promotion: moveUci.length > 4 ? moveUci.slice(4) : undefined,
        });

        console.log(`[showSolution] Move ${i + 1} successful:`, moveResult);
        console.log(`[showSolution] New FEN after move: ${chess.fen()}`);

        setFen(chess.fen());
      } catch (error) {
        console.error(`[showSolution] ERROR on move ${i + 1}:`, error);
        console.error(`[showSolution] Failed move UCI: "${moveUci}"`);
        console.error(`[showSolution] FEN at failure: ${chess.fen()}`);
        console.error(`[showSolution] Legal moves at this position:`, chess.moves({ verbose: true }));
        throw error; // Re-throw to stop execution
      }
    }

    console.log('[showSolution] Solution replay completed successfully');
    console.log('[showSolution] Final FEN:', chess.fen());
  };

  const showFullSolution = async (startingFen: string, allMoves: string[]) => {
    console.log('[showFullSolution] Starting full solution replay from beginning');
    console.log('[showFullSolution] Starting FEN:', startingFen);
    console.log('[showFullSolution] All moves:', allMoves);
    console.log('[showFullSolution] Total moves:', allMoves.length);

    const chess = new Chess(startingFen);
    const moveSpeed = 1200; // milliseconds per move

    // Play ALL puzzle moves from the beginning (including opponent's setup)
    for (let i = 0; i < allMoves.length; i++) {
      const moveUci = allMoves[i];
      console.log(`[showFullSolution] Move ${i + 1}/${allMoves.length}: "${moveUci}"`);
      console.log(`[showFullSolution] Current FEN before move: ${chess.fen()}`);

      await new Promise((resolve) => setTimeout(resolve, moveSpeed));

      try {
        const moveResult = chess.move({
          from: moveUci.slice(0, 2),
          to: moveUci.slice(2, 4),
          promotion: moveUci.length > 4 ? moveUci.slice(4) : undefined,
        });

        console.log(`[showFullSolution] Move ${i + 1} successful:`, moveResult);
        setFen(chess.fen());
      } catch (error) {
        console.error(`[showFullSolution] ERROR on move ${i + 1}:`, error);
        console.error(`[showFullSolution] Failed move UCI: "${moveUci}"`);
        console.error(`[showFullSolution] FEN at failure: ${chess.fen()}`);
        console.error(`[showFullSolution] Legal moves:`, chess.moves({ verbose: true }));
        throw error;
      }
    }

    console.log('[showFullSolution] Full solution replay completed');
    console.log('[showFullSolution] Final FEN:', chess.fen());
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

    // Determine player side after opponent's setup move
    const chess = new Chess(puzzleData.puzzle.FEN);
    if (puzzleData.puzzle.Moves.length > 0) {
      const opponentSetupMove = puzzleData.puzzle.Moves[0];
      chess.move({
        from: opponentSetupMove.slice(0, 2),
        to: opponentSetupMove.slice(2, 4),
        promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
      });
    }
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

    // Update player side for correct orientation
    const chess = new Chess(puzzleData.puzzle.FEN);
    if (puzzleData.puzzle.Moves.length > 0) {
      const opponentSetupMove = puzzleData.puzzle.Moves[0];
      chess.move({
        from: opponentSetupMove.slice(0, 2),
        to: opponentSetupMove.slice(2, 4),
        promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
      });
    }
    setPlayerSide(chess.turn());

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

    // Update player side for correct orientation
    const chess = new Chess(puzzleData.puzzle.FEN);
    if (puzzleData.puzzle.Moves.length > 0) {
      const opponentSetupMove = puzzleData.puzzle.Moves[0];
      chess.move({
        from: opponentSetupMove.slice(0, 2),
        to: opponentSetupMove.slice(2, 4),
        promotion: opponentSetupMove.length > 4 ? opponentSetupMove.slice(4) : undefined,
      });
    }
    setPlayerSide(chess.turn());

    // Get the starting FEN for the full replay
    const startingFen = puzzleData.puzzle.FEN;

    // Small delay before starting replay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Show the full solution from the beginning
    await showFullSolution(startingFen, puzzleData.puzzle.Moves);

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
    setAutoNextPuzzle,
  };
}
