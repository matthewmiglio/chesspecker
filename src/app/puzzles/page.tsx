"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { usePuzzleSession } from "@/lib/hooks/usePuzzleSession";
import {
  getAllSetData,
  getSetAccuracy,
  getSetProgress,
} from "@/lib/api/puzzleApi";
import { deleteUserSet } from "@/lib/api/setsApi";

import { PuzzleSet } from "@/lib/types";


import NotLoggedInButton from "@/components/puzzles/not-logged-in-button";
import SetSelectTable from "@/components/puzzles/set-select-table";
import PuzzleBoardArea from "@/components/puzzles/PuzzleBoardArea";
import PuzzleEmptyState from "@/components/puzzles/PuzzleEmptyState";
import { showConfirmDeletePopup } from "@/components/puzzles/ConfirmDeletePopup";
import FeedbackCTA from "@/components/puzzles/FeedbackCTA";

export default function PuzzlesPage() {
  const { data: session, status: authStatus } = useSession();
  const userIsLoggedIn = authStatus === "authenticated";
  const isAuthChecked = authStatus !== "loading";

  console.log('[PuzzlesPage] COMPONENT RENDER START');

  const [selectedSetId, setSelectedSetId] = useState<number | null>(() => {
    console.log('[PuzzlesPage] Initializing selectedSetId state');
    return null;
  });
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>(() => {
    const defaultFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    console.log('[PuzzlesPage] Initializing FEN state to:', defaultFen);
    return defaultFen;
  });
  const [startingFen, setStartingFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

  // Debug logging for FEN changes
  useEffect(() => {
    console.log('[PuzzlesPage] FEN state updated to:', fen, 'at timestamp:', Date.now());
  }, [fen]);

  const [solution, setSolution] = useState<string[]>([]);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);

  // Debug logging for selectedSetId changes
  useEffect(() => {
    console.log('[PuzzlesPage] selectedSetId changed to:', selectedSetId);
    console.log('[PuzzlesPage] puzzleIds:', puzzleIds);
    console.log('[PuzzlesPage] currentPuzzleIndex:', currentPuzzleIndex);
  }, [selectedSetId, puzzleIds, currentPuzzleIndex]);
  const [setAccuracies, setSetAccuracies] = useState<
    Record<number, { correct: number; incorrect: number }>
  >({});
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [playerSide, setPlayerSide] = useState<"w" | "b">("w");

  const [isSetDataLoaded, setIsSetDataLoaded] = useState(false);

  const [setProgressMap, setSetProgressMap] = useState<
    Record<number, { repeat_index: number; puzzle_index: number }>
  >({});

  const [autoShowSolution, setAutoShowSolution] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [boardThemeIndex, setBoardThemeIndex] = useState(0);

  const puzzleSession = usePuzzleSession({
    getSelectedSetId: () => selectedSetId,
    currentRepeatIndex,
    puzzleIds,
    startingFen,
    solution,
    solvedIndex,
    setFen,
    setStartingFen,
    setSolution,
    setSolvedIndex,
    setHighlight,
    setCurrentRepeatIndex,
    setCurrentPuzzleIndex,
    setAccuracies: setSetAccuracies,
    userSets,
    currentPuzzleIndex,
    setPlayerSide,
    autoShowSolution,
    setResetKey,
  });

  console.log('[PuzzlesPage] After usePuzzleSession - selectedSetId:', selectedSetId, 'fen:', fen, 'isSessionActive:', puzzleSession.isSessionActive);

  const selectedSet = userSets.find((s) => s.set_id === selectedSetId);
  const selectedSetIsDone =
    !!selectedSet && currentRepeatIndex >= (selectedSet?.repeats ?? Infinity);

  // Always use dark mode image
  const heroImage = "/heros/chess-focus-white.png";

  const handleSetDelete = async (setId: number) => {
    const confirmed = await showConfirmDeletePopup();
    if (!confirmed) return;

    const success = await deleteUserSet(setId);

    if (success) {
      setUserSets((prev) => prev.filter((set) => set.set_id !== setId));
      if (selectedSetId === setId) {
        setSelectedSetId(null);
      }
      sessionStorage.removeItem("selected_set_id");
    }
  };

  useEffect(() => {

    const run = async () => {
      if (authStatus === "loading") {
        return;
      }

      if (authStatus !== "authenticated") {
        setIsSetDataLoaded(true);
        return;
      }

      if (!session?.user?.email) {
        setIsSetDataLoaded(true);
        return;
      }


      try {
        const sets = await getAllSetData();

        if (!sets) {
          setIsSetDataLoaded(true);
          return;
        }

        setUserSets(sets);

        const accuracies: Record<
          number,
          { correct: number; incorrect: number }
        > = {};
        const progressMap: Record<
          number,
          { repeat_index: number; puzzle_index: number }
        > = {};

        for (const set of sets) {
          let repeat_index = set.repeat_index;
          if (repeat_index === set.size) {
            repeat_index = set.size - 1;
          }

          const acc = await getSetAccuracy(set.set_id, repeat_index);
          if (acc) {
            accuracies[set.set_id] = acc;
          }

          const progress = await getSetProgress(set.set_id);
          if (progress) {
            progressMap[set.set_id] = {
              repeat_index: progress.repeat_index,
              puzzle_index: progress.puzzle_index,
            };
          }
        }

        setSetAccuracies(accuracies);
        setSetProgressMap(progressMap);
      } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("Error fetching set data:", message);

      }

      setIsSetDataLoaded(true);
    };

    run();
  }, [authStatus, session]);

  // Show not logged in state immediately when we know user isn't authenticated
  if (isAuthChecked && !userIsLoggedIn) {
    return (
      <div>
        <div className="flex justify-center items-center h-[60vh]">
          <NotLoggedInButton />
        </div>
        <FeedbackCTA />
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto">
        {selectedSet ? (
          <PuzzleBoardArea
            selectedSet={selectedSet}
            selectedSetId={selectedSetId}
            selectedSetIsDone={selectedSetIsDone}
            fen={fen}
            solution={solution}
            solvedIndex={solvedIndex}
            puzzleSession={puzzleSession}
            highlight={highlight}
            setHighlight={setHighlight}
            playerSide={playerSide}
            setAccuracies={setAccuracies}
            currentPuzzleIndex={currentPuzzleIndex}
            currentRepeatIndex={currentRepeatIndex}
            puzzleIds={puzzleIds}
            autoShowSolution={autoShowSolution}
            setAutoShowSolution={setAutoShowSolution}
            isLoading={!isSetDataLoaded}
            resetKey={resetKey}
            boardThemeIndex={boardThemeIndex}
            setBoardThemeIndex={setBoardThemeIndex}
          />
        ) : (
          <PuzzleEmptyState
            heroImage={heroImage}
            userSetsLength={userSets.length}
            userIsLoggedIn={userIsLoggedIn}
            selectedSetExists={!!selectedSet}
            isLoading={!isSetDataLoaded}
          />
        )}

        <SetSelectTable
          userSets={userSets}
          selectedSetId={selectedSetId}
          setSelectedSetId={setSelectedSetId}
          setPuzzleIds={setPuzzleIds}
          setCurrentRepeatIndex={setCurrentRepeatIndex}
          setCurrentPuzzleIndex={setCurrentPuzzleIndex}
          setFen={setFen}
          setStartingFen={setStartingFen}
          setSolution={setSolution}
          setSolvedIndex={setSolvedIndex}
          setHighlight={setHighlight}
          setPlayerSide={setPlayerSide}
          setProgressMap={setProgressMap}
          setAccuracies={setAccuracies}
          puzzleSession={puzzleSession}
          handleSetDelete={handleSetDelete}
          isLoading={!isSetDataLoaded}
        />
      </div>

      <FeedbackCTA />
    </div>
  );
}
