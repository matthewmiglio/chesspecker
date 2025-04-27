"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSession } from "next-auth/react";

import { usePuzzleSession } from "@/lib/hooks/usePuzzleSession";
import { handleSetSelect } from "@/lib/hooks/usePuzzleData";

import {
  getAllSetData,
  getSetAccuracy,
  getSetProgress,
  
} from "@/lib/api/puzzleApi";

import { PuzzleSet } from "@/lib/types";

import ChessBoardWrapper from "@/components/chess-board-wrapper";
import CreateSetButton from "@/components/create-set-button";
import NotLoggedInButton from "@/components/not-logged-in-button";
import NoSetSelectedButton from "@/components/no-set-selected-button";
import SetFinishedGraphic from "@/components/set-finished-graphic";
import SetSelectTable from "@/components/set-select-table";

export default function PuzzlesPage() {
  const { data: session, status: authStatus } = useSession();

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
  const puzzleSession = usePuzzleSession({
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
    setAccuracies: setSetAccuracies,
    userSets,
    currentPuzzleIndex,
    setPlayerSide,
  });

  const [isFinishedLoading, setIsFinishedLoading] = useState<boolean>(false);

  const [setProgressMap, setSetProgressMap] = useState<
    Record<number, { repeat_index: number; puzzle_index: number }>
  >({});

  const showConfirmDeletePopup = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create the overlay
      const overlay = document.createElement("div");
      overlay.className = `
        fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]
        opacity-0 transition-opacity duration-300
      `;

      // Create the popup box
      const popup = document.createElement("div");
      popup.className = `
        bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center space-y-4
        transform scale-90 opacity-0 transition-all duration-300
      `;

      // Message
      const message = document.createElement("p");
      message.innerText = "Are you sure you want to delete this set?";
      message.className = "text-lg text-gray-800";

      // Buttons container
      const buttons = document.createElement("div");
      buttons.className = "flex space-x-4";

      // Confirm button
      const confirmButton = document.createElement("button");
      confirmButton.innerText = "Delete";
      confirmButton.className = `
        bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition
      `;
      confirmButton.onclick = () => {
        cleanup();
        resolve(true);
      };

      // Cancel button
      const cancelButton = document.createElement("button");
      cancelButton.innerText = "Cancel";
      cancelButton.className = `
        bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition
      `;
      cancelButton.onclick = () => {
        cleanup();
        resolve(false);
      };

      // Assemble
      buttons.appendChild(confirmButton);
      buttons.appendChild(cancelButton);
      popup.appendChild(message);
      popup.appendChild(buttons);
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      // Animate overlay and popup in
      requestAnimationFrame(() => {
        overlay.classList.remove("opacity-0");
        overlay.classList.add("opacity-100");

        popup.classList.remove("scale-90", "opacity-0");
        popup.classList.add("scale-100", "opacity-100");
      });

      // Cleanup
      const cleanup = () => {
        overlay.classList.remove("opacity-100");
        overlay.classList.add("opacity-0");

        popup.classList.remove("scale-100", "opacity-100");
        popup.classList.add("scale-90", "opacity-0");

        popup.addEventListener(
          "transitionend",
          () => {
            document.body.removeChild(overlay);
          },
          { once: true }
        );
      };

      // Optional: Escape key closes popup
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          cleanup();
          resolve(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown, { once: true });
    });
  };

  const handleSetDelete = async (setId: number) => {
    console.log("User clicked remove on this set:", setId);
    const confirmed = await showConfirmDeletePopup();
    if (!confirmed) {
      console.log("User cancelled set deletion.");
      return;
    }
    console.log("User confirmed set deletion.");

    const res = await fetch("/api/removeSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId }),
    });

    if (!res.ok) {
      console.log("Failed to delete set");
      return;
    }
    setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
    if (selectedSetId === setId) {
      setSelectedSetId(null);
    }
    sessionStorage.removeItem("selected_set_id");
  };

  //stays here

  useEffect(() => {
    console.log("puzzles page useEffect()");

    const run = async () => {
      const updateUserSetData = async () => {
        console.log("updateUserSetData()");

        // get logged in email
        if (!session?.user?.email) {
          console.error("User is not logged in or session is missing email");
          return;
        }
        const email = session.user.email;

        // grab set data
        const sets = await getAllSetData(email);
        if (!sets) {
          console.error("Failed to fetch user sets");
          return;
        }
        setUserSets(sets);
        console.log("Got", sets.length, "sets for this user!");

        const accuracies: Record<
          number,
          { correct: number; incorrect: number }
        > = {};
        const progressMap: Record<
          number,
          { repeat_index: number; puzzle_index: number }
        > = {};

        console.log("getting set accuracies...");
        for (const set of sets) {
          console.log("\tGetting set accuracy for set id:", set.set_id, "...");

          let repeat_index = set.repeat_index;
          if (repeat_index === set.size) {
            console.log("Set is finished, using previous repeat index");
            repeat_index = set.size - 1;
          }

          const res = await getSetAccuracy(set.set_id, repeat_index);
          if (res) {
            accuracies[set.set_id] = res;
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
        console.log("Updated setAccuracies & setProgressMap!");
      };

      if (authStatus === "authenticated") {
        await updateUserSetData();
        setUserIsLoggedIn(true);
        console.log("Set userIsLoggedIn to true");
      } else {
        setUserIsLoggedIn(false);
        console.log("Set userIsLoggedIn to false");
      }

      setIsFinishedLoading(true);
      console.log("Set isFinishedLoading to true");
      console.log("End of puzzles page useEffect()");
    };

    run();
  }, [authStatus]);
  const selectedSet = userSets.find((s) => s.set_id === selectedSetId);

  const selectedSetIsDone =
    !!selectedSet && currentRepeatIndex >= (selectedSet?.repeats ?? Infinity);

  console.log(
    "🧩 [render] selectedSetId:",
    selectedSetId,
    "currentRepeatIndex:",
    currentRepeatIndex,
    "set.repeats:",
    selectedSet?.repeats,
    "selectedSetIsDone:",
    selectedSetIsDone
  );

  return (
    <div>
      {isFinishedLoading ? (
        <div className="mx-auto">
          {/*Show Chess board if user is logged in and has a selected set*/}
          {selectedSet && userIsLoggedIn ? (
            <div>
              {selectedSetIsDone ? (
                <SetFinishedGraphic />
              ) : (
                <ChessBoardWrapper
                  fen={fen}
                  solution={solution}
                  solvedIndex={solvedIndex}
                  puzzleSession={puzzleSession}
                  highlight={highlight}
                  setHighlight={setHighlight}
                  playerSide={playerSide}
                  selectedSetId={selectedSetId}
                  setAccuracies={setAccuracies}
                  currentPuzzleIndex={currentPuzzleIndex}
                  currentRepeatIndex={currentRepeatIndex}
                  selectedSet={selectedSet}
                />
              )}
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center  h-full min-h-[400px] border bg-muted/20">
              <div className="text-center p-8">
                {/*Show no sets button if there are no sets AND logged in */}
                {userSets.length === 0 && userIsLoggedIn ? (
                  <CreateSetButton />
                ) : (
                  <></>
                )}

                {/*Show user not logged in message if not logged in */}
                {!userIsLoggedIn ? <NotLoggedInButton /> : <></>}

                {/*If user has sets and is logged in, but a set isnt selected */}
                {userIsLoggedIn && !selectedSet && userSets.length != 0 ? (
                  <NoSetSelectedButton />
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}

          {/*User sets*/}
          {userIsLoggedIn && userSets.length != 0 ? (
            <SetSelectTable
              userSets={userSets}
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
          ) : (
            <div className="mb-50"></div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
          <Card>
            <CardContent className="space-y-6">
              {/* Skeleton board area */}
              <div className="h-[360px] w-full bg-muted rounded-lg" />

              {/* Info section */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <div className="h-10 w-32 bg-muted rounded" />
            </CardFooter>
          </Card>

          {/* Skeleton set list */}
          <div
            className="sm:mt-10
             mt-0 space-y-4"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 w-full bg-muted rounded-lg shadow-inner"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
