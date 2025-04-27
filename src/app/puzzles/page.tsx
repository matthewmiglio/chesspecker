"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { usePuzzleSession } from "@/lib/hooks/usePuzzleSession";
import {
  getAllSetData,
  getSetAccuracy,
  getSetProgress,
} from "@/lib/api/puzzleApi";

import { PuzzleSet } from "@/lib/types";

import SetSelectTable from "@/components/puzzles/set-select-table";
import PuzzleBoardArea from "@/components/puzzles/PuzzleBoardArea";
import PuzzleEmptyState from "@/components/puzzles/PuzzleEmptyState";
import PuzzlePageLoading from "@/components/puzzles/PuzzlePageSkeleton";
import { showConfirmDeletePopup } from "@/components/puzzles/ConfirmDeletePopup";

export default function PuzzlesPage() {
  const { data: session, status: authStatus } = useSession();
  const { resolvedTheme } = useTheme();

  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [solution, setSolution] = useState<string[]>([]);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);
  const [setAccuracies, setSetAccuracies] = useState<
    Record<number, { correct: number; incorrect: number }>
  >({});
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [playerSide, setPlayerSide] = useState<"w" | "b">("w");

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSetDataLoaded, setIsSetDataLoaded] = useState(false);

  const [setProgressMap, setSetProgressMap] = useState<
    Record<number, { repeat_index: number; puzzle_index: number }>
  >({});

  const puzzleSession = usePuzzleSession({
    getSelectedSetId: () => selectedSetId,
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
    setAccuracies: setSetAccuracies,
    userSets,
    currentPuzzleIndex,
    setPlayerSide,
  });

  const selectedSet = userSets.find((s) => s.set_id === selectedSetId);
  const selectedSetIsDone =
    !!selectedSet && currentRepeatIndex >= (selectedSet?.repeats ?? Infinity);

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/chess-focus-white.png"
      : "/heros/chess-focus-black.png";

  const handleSetDelete = async (setId: number) => {
    const confirmed = await showConfirmDeletePopup();
    if (!confirmed) return;

    const res = await fetch("/api/removeSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId }),
    });

    if (res.ok) {
      setUserSets((prev) => prev.filter((set) => set.set_id !== setId));
      if (selectedSetId === setId) {
        setSelectedSetId(null);
      }
      sessionStorage.removeItem("selected_set_id");
    } else {
      console.error("Failed to delete set");
    }
  };

  useEffect(() => {
    const run = async () => {
      if (authStatus !== "authenticated") {
        setUserIsLoggedIn(false);
        setIsAuthChecked(true);
        console.log("[PuzzleLoading] set isAuthChecked to true");
        return;
      }

      if (!session?.user?.email) {
        console.error("User is not logged in or missing email");
        setIsAuthChecked(true);
        console.log("[PuzzleLoading] set isAuthChecked to true");
        return;
      }

      setUserIsLoggedIn(true);
      setIsAuthChecked(true);

      const email = session.user.email;
      const sets = await getAllSetData(email);
      if (!sets) {
        console.error("Failed to fetch user sets");
        console.log("[PuzzleLoading] set isSetDataLoaded to true");
        setIsSetDataLoaded(true);
        return;
      }

      setUserSets(sets);
      setIsSetDataLoaded(true);
      console.log("[PuzzleLoading] set isSetDataLoaded to true");

      const accuracies: Record<number, { correct: number; incorrect: number }> =
        {};
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
        if (acc) accuracies[set.set_id] = acc;

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
      setIsSetDataLoaded(true);
    };

    run();
  }, [authStatus, session]);

  return (
    <div>
      {isAuthChecked && isSetDataLoaded ? (
        <div className="mx-auto">
          {selectedSet && userIsLoggedIn ? (
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
            />
          ) : (
            <PuzzleEmptyState
              heroImage={heroImage}
              userSetsLength={userSets.length}
              userIsLoggedIn={userIsLoggedIn}
              selectedSetExists={!!selectedSet}
            />
          )}

          {userIsLoggedIn && userSets.length !== 0 && (
            <SetSelectTable
              userSets={userSets}
              selectedSetId={selectedSetId}
              setSelectedSetId={setSelectedSetId}
              setPuzzleIds={setPuzzleIds}
              setCurrentRepeatIndex={setCurrentRepeatIndex}
              setCurrentPuzzleIndex={setCurrentPuzzleIndex}
              setFen={setFen}
              setSolution={setSolution}
              setSolvedIndex={setSolvedIndex}
              setHighlight={setHighlight}
              setPlayerSide={setPlayerSide}
              setProgressMap={setProgressMap}
              setAccuracies={setAccuracies}
              puzzleSession={puzzleSession}
              handleSetDelete={handleSetDelete}
            />
          )}
        </div>
      ) : (
        <PuzzlePageLoading />
      )}
    </div>
  );
}
