"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AnimatedBoard from "@/components/chess-board";
import { useSession } from "next-auth/react";

import { showConfetti, showGreenCheck, showRedX } from "@/lib/visuals";

import { PuzzleSet, PuzzleData } from "@/lib/types";
import LoginButton from "@/components/LoginButton";

export default function PuzzlesPage() {
  const { data: session, status: authStatus } = useSession();

  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [solution, setSolution] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isFinishedLoading, setIsFinishedLoading] = useState<boolean>(false);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  useState<number>(0);
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);
  const [playerSide, setPlayerSide] = useState<"w" | "b">("w");
  const [setAccuracies, setSetAccuracies] = useState<
    Record<number, { correct: number; incorrect: number }>
  >({});
  const [setProgressMap, setSetProgressMap] = useState<
    Record<number, { repeat_index: number; puzzle_index: number }>
  >({});

  const addIncorrectAttempt = async (setId: number, repeatIndex: number) => {
    try {
      const res = await fetch("/api/addIncorrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to add incorrect attempt");

      return true;
    } catch (err) {
      console.error("Error adding incorrect attempt:", err);
      return false;
    }
  };

  const addCorrectAttempt = async (setId: number, repeatIndex: number) => {
    try {
      const res = await fetch("/api/addCorrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to add correct attempt");

      return true;
    } catch (err) {
      console.error("Error adding correct attempt:", err);
      return false;
    }
  };

  const getAllSetData = async (email: string) => {
    const response = await fetch("/api/getSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      console.error("Failed to fetch user sets");
      return;
    }
    console.log("Valid response for this user's set data");

    const result = await response.json();
    const sets: PuzzleSet[] = result.sets;
    return sets;
  };

  useEffect(() => {
    const updateUserSetData = async () => {
      console.log("updateUserSetData()");

      //get logged in email
      if (!session?.user?.email) {
        console.error("User is not logged in or session is missing email");
        return;
      }
      const email = session.user.email;

      //grab set data
      const sets = await getAllSetData(email);
      if (!sets) {
        console.error("Failed to fetch user sets");
        return;
      }
      setUserSets(sets);
      console.log("This is the set data:");
      console.log("Got", sets.length, "for this user!");
      for (const set of sets) {
        console.log(
          `\tSet ID: ${set.set_id}, Name: ${set.name}, Elo: ${set.elo}, Size: ${set.size}, Repeat index: ${set.repeat_index}, Puzzle index: ${set.puzzle_index}`
        );
      }

      const accuracies: Record<number, { correct: number; incorrect: number }> =
        {};
      const progressMap: Record<
        number,
        { repeat_index: number; puzzle_index: number }
      > = {};

      console.log("getting set accuracies...");
      for (const set of sets) {
        let repeat_index = set.repeat_index;
        if (repeat_index === set.size) {
          console.log("This set is finished so getting prev repeat index");
          repeat_index = set.size - 1;
        }

        const res = await getSetAccuracy(set.set_id, repeat_index);
        if (res) {
          accuracies[set.set_id] = res;
        }
        console.log(
          "\tSet accuracy request result: set id:",
          set.set_id,
          " repeat index:",
          set.repeat_index,
          " correct:",
          res?.correct,
          " incorrect:",
          res?.incorrect
        );

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
    };

    if (authStatus === "authenticated") {
      setUserIsLoggedIn(true);
      updateUserSetData();
    } else {
      setUserIsLoggedIn(false);
    }

    setIsFinishedLoading(true);
  }, [authStatus]);

  const getSetAccuracy = async (setId: number, repeatIndex: number) => {
    try {
      const res = await fetch("/api/getSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok) return { correct: 0, incorrect: 0 };

      return { correct: data.correct, incorrect: data.incorrect };
    } catch (err) {
      console.error("Error fetching set accuracy:", err);
      return null;
    }
  };

  const updatePuzzleProgress = async () => {
    console.log("Updating puzzle progress...");
    if (!selectedSetId) {
      console.log(
        "No set is currently selected, so skipping updating puzzle progress."
      );
      return;
    }
    const currentSetProgress = await getSetProgress(selectedSetId);
    if (!currentSetProgress) {
      console.log(
        "Faiiled to get set progress for selected set id:",
        selectedSetId,
        "so cannot update puzzle progress."
      );
      return;
    }
    const repeat_index = currentSetProgress.repeat_index;
    const puzzle_index = currentSetProgress.puzzle_index;
    if (!repeat_index || !puzzle_index) {
      return;
    }
    setCurrentRepeatIndex(repeat_index);
    setCurrentPuzzleIndex(puzzle_index);
  };

  const handleStartSession = async () => {
    console.log("handleStartSession()");
    setIsSessionActive(true);
    if (!selectedSetId) {
      return;
    }
    await updatePuzzleProgress();
  };

  const getFenAtPly = (pgn: string, initialPly: number) => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history({ verbose: true });
    const replay = new Chess();

    for (let i = 0; i < initialPly && i < history.length; i++) {
      const move = history[i];
      replay.move(move);
    }

    return replay.fen();
  };

  const setIsDone = () => {
    const set = userSets.find((s) => s.set_id === selectedSetId);
    if (!set) return false;
    if (currentRepeatIndex === set.repeats) {
      return true;
    }
    return false;
  };

  const selectedSet = userSets.find((s) => s.set_id === selectedSetId);

  const getPuzzleData = async (puzzleId: string) => {
    const response = await fetch(`/api/getPuzzleById?id=${puzzleId}`);
    if (!response.ok) return null;
    return await response.json();
  };

  const loadPuzzleAndInitialize = async (puzzleData: PuzzleData) => {
    const fen = getFenAtPly(
      puzzleData.game.pgn,
      puzzleData.puzzle.initialPly + 1
    );
    setFen(fen);
    setSolution(puzzleData.puzzle.solution);
    setSolvedIndex(0);
    setHighlight(null);

    const initialGame = new Chess();
    initialGame.load(fen);
    const playerSide = initialGame.turn();
    setPlayerSide(playerSide);
  };

  const handleSetSelect = async (setId: number) => {
    console.log("handleSetSelect()");
    setSelectedSetId(setId);
    console.log("User just selected set id:", setId);
    setIsSessionActive(false);
    console.log("Just set session to inactive");
    sessionStorage.setItem("selected_set_id", String(setId));
    const set = userSets.find((s) => s.set_id === setId);

    if (
      !set ||
      !set.elo ||
      !set.size ||
      (!set.puzzle_index && set.puzzle_index != 0)
    ) {
      console.log("Invlaid set data:", set, "Cannot handle set select!");
      return;
    }

    const currentIndex = set.puzzle_index;
    const puzzleIds = set.puzzle_ids;
    setPuzzleIds(puzzleIds);
    console.log("Updated puzzle ids with", puzzleIds.length, "puzzles!");
    const puzzleId = puzzleIds[currentIndex];
    console.log("This puzzle id is", puzzleId);
    const puzzle = await getPuzzleData(puzzleId);
    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
    } else {
      console.log(
        "failed to load puzzle data for puzzle id:",
        puzzleId,
        "Cannot handle set select!"
      );
      return;
    }
    handleStartSession();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const thisSetProgress = await getSetProgress(setId);
    if (thisSetProgress) {
      setCurrentRepeatIndex(thisSetProgress.repeat_index);
      setCurrentPuzzleIndex(thisSetProgress.puzzle_index);
    } else {
      console.log("WARNING: Failed to get set progress for set id:", setId);
      console.log("This is the set progress:", thisSetProgress);
    }
  };

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

  const incrementPuzzleIndex = async () => {
    console.log("incrementPuzzleIndex()");
    const setId = selectedSetId;

    if (!setId) {
      return;
    }

    const currentSetProgress = await getSetProgress(selectedSetId);
    if (!currentSetProgress) {
      return;
    }

    let repeat_index = currentSetProgress.repeat_index;
    let puzzle_index = currentSetProgress.puzzle_index;
    const size = currentSetProgress.size;

    if (puzzle_index + 1 === size) {
      puzzle_index = 0;
      repeat_index++;
    } else {
      puzzle_index++;
    }

    await setSetProgress(setId, repeat_index, puzzle_index);

    console.log("Updating puzzle/repeat with", puzzle_index, "/", repeat_index);
    setCurrentRepeatIndex(repeat_index);
    setCurrentPuzzleIndex(puzzle_index);

    return puzzle_index;
  };

  const puzzleIsFinished = () => {
    if (solution.length + 1 == solvedIndex) {
      return true;
    } else {
      return false;
    }
  };

  const handleNextPuzzle = async () => {
    console.log("handleNextPuzzle()");
    if (setIsDone()) {
      showConfetti();
      return;
    }

    if (!puzzleIsFinished) {
      return;
    }

    const puzzleIndex = await incrementPuzzleIndex();
    const puzzleId = puzzleIds[puzzleIndex];
    const puzzle = await getPuzzleData(puzzleId);

    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
    }

    await updatePuzzleProgress();
    await updateThisSetAccuracy();
  };

  const getSetProgress = async (set_id: number) => {
    const response = await fetch("/api/getSetProgressStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    return result.progress;
  };

  const setSetProgress = async (
    set_id: number,
    repeat_index: number,
    puzzle_index: number
  ) => {
    const response = await fetch("/api/updateSetProgressStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id, repeat_index, puzzle_index }),
    });

    return response.ok;
  };

  const showSolution = async () => {
    const chess = new Chess(fen);
    const remainingSolution = solution.slice(solvedIndex);

    for (let i = 0; i < remainingSolution.length; i++) {
      const moveUci = remainingSolution[i];
      await new Promise((resolve) => setTimeout(resolve, 600)); // delay 600ms per move

      chess.move({
        from: moveUci.slice(0, 2),
        to: moveUci.slice(2, 4),
        promotion: moveUci.length > 4 ? moveUci.slice(4) : undefined,
      });

      setFen(chess.fen());
    }
  };

  const handleIncorrectMove = async () => {
    const setId = selectedSetId;
    if (!setId) return;
    showRedX();
    await addIncorrectAttempt(setId, currentRepeatIndex);

    await showSolution();
    console.log("This puzzle was unsuccessful!");
    await handleNextPuzzle();
  };

  const handleSuccessfulPuzzle = async () => {
    const setId = selectedSetId;
    if (!setId) {
      return;
    }
    await addCorrectAttempt(selectedSetId, currentRepeatIndex);
    console.log("This puzzle was successful!");
    await handleNextPuzzle();
  };

  const parseUCIMove = (uci: string) => ({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4) : undefined,
  });

  const handleMove = (move: string, isCorrect: boolean) => {
    if (!isSessionActive) return;

    if (!isCorrect) {
      handleIncorrectMove();
      return;
    }

    showGreenCheck();
    setSolvedIndex((i) => i + 2);

    const chess = new Chess();
    chess.load(fen);

    // ✅ Use solution move instead of player input
    chess.move(parseUCIMove(solution[solvedIndex]));

    const computerMove = solution[solvedIndex + 1];
    if (computerMove) {
      chess.move(parseUCIMove(computerMove));
    }

    setFen(chess.fen());

    if (solvedIndex + 1 === solution.length) {
      handleSuccessfulPuzzle();
    }
  };

  const updateThisSetAccuracy = async () => {
    if (!selectedSetId) {
      console.log("No selected set id");
      return;
    }
    const { repeat_index, puzzle_index } = await getSetProgress(selectedSetId);

    const accuracyStats = await getSetAccuracy(selectedSetId, repeat_index);
    const correct = accuracyStats?.correct || 0;
    const incorrect = accuracyStats?.incorrect || 0;

    console.log("\tUpdating this puzzle:", selectedSetId);
    console.log("\taccuracyStats:", accuracyStats);
    console.log("\trepeat_index:", repeat_index);
    console.log("\tpuzzle_index:", puzzle_index);
    console.log("\tcorrect:", correct);
    console.log("\tincorrect:", incorrect);
    console.log("\tAccuracy:", correct / incorrect);

    if (accuracyStats) {
      setAccuracies[selectedSetId] = { correct, incorrect };
    }
  };

  return (
    <div>
      {isFinishedLoading ? (
        <div className="mx-auto">
          {/*Chess board*/}
          {selectedSet && userIsLoggedIn ? (
            <div className=" mx-auto  rounded-xl ">
              <Card>
                <CardContent className="px-0 mx-auto">
                  <div className="flex ">
                    <AnimatedBoard
                      fen={fen}
                      solution={solution}
                      solvedIndex={solvedIndex}
                      onMove={handleMove}
                      highlight={highlight}
                      isSessionActive={isSessionActive}
                      sideOnBottom={playerSide}
                    />
                  </div>
                </CardContent>

                {/*info below the puzzle*/}
                <CardFooter className="px-3 py-2 flex justify-center">
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                    {/* Accuracy */}
                    <div className="flex items-center gap-1">
                      <span className="whitespace-nowrap">Accuracy:</span>
                      <span className="font-medium">
                        {selectedSetId !== null && setAccuracies[selectedSetId]
                          ? `${Math.round(
                              (setAccuracies[selectedSetId].correct /
                                (setAccuracies[selectedSetId].correct +
                                  setAccuracies[selectedSetId].incorrect ||
                                  1)) *
                                100
                            )}%`
                          : "N/A"}
                      </span>
                    </div>

                    {/* Puzzle Progress */}
                    <div className="flex items-center gap-1">
                      <PuzzleIcon className="w-4 h-4" />
                      <span>
                        {currentPuzzleIndex} / {selectedSet.size}
                      </span>
                    </div>

                    {/* Repeat Progress */}
                    <div className="flex items-center gap-1">
                      <RepeatIcon className="w-4 h-4" />
                      <span>
                        {currentRepeatIndex} / {selectedSet.repeats}
                      </span>
                    </div>

                    {/* Hint Button */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        className="flex items-center p-0"
                        onClick={() =>
                          setHighlight(solution[solvedIndex]?.slice(2) ?? null)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Hint
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center  h-full min-h-[400px] border bg-muted/20">
              <div className="text-center p-8">
                {/*Show no sets button if there are no sets AND logged in */}
                {userSets.length === 0 && userIsLoggedIn ? (
                  <Button className="" variant="outline" asChild>
                    <Link href="/create">Create Your First Set</Link>
                  </Button>
                ) : (
                  <></>
                )}

                {/*Show user not logged in message if not logged in */}
                {!userIsLoggedIn ? (
                  <div className="text-red-500 grid-cols-1 flex justify-center items-center">
                    You must sign in to pratice!
                    <div className="px-5">
                      {" "}
                      <LoginButton />
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                {/*If user has sets and is logged in, but a set isnt selected */}
                {userIsLoggedIn && !selectedSet && userSets.length != 0 ? (
                  <div>
                    <p> Select a set to being practicing!</p>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}

          {/*User sets*/}
          {userIsLoggedIn && userSets.length != 0 ? (
            <div
              className="w-[100%] sm:w-[90%] mx-auto
             sm:mt-10
             mt-0
             grid grid-cols-1 "
            >
              {/*Sets Table header row*/}
              <div
                className="border
              sm:rounded-t-lg
              rounded-none
              bg-muted/90"
              >
                <div className="text-md grid grid-cols-6 ">
                  <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
                    Name
                  </div>
                  <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
                    ELO
                  </div>
                  <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
                    Set #
                  </div>
                  <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
                    <PuzzleIcon />
                  </div>
                  <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
                    <RepeatIcon />
                  </div>
                  <div> </div>
                </div>
              </div>

              {/*Sets Table data*/}
              <div
                className=" border  bg-muted/20 sm:rounded-b-lg
              rounded-none"
              >
                {userSets.map((set) => (
                  <div key={set.set_id} className="">
                    <div
                      key={set.set_id}
                      className={`cursor-pointer bg-transparent transition-all py-0 ${
                        selectedSetId === set.set_id ? "border-primary" : ""
                      }`}
                    >
                      <div className="min-h-[70px] text-xs grid grid-cols-6 rounded-2xl">
                        <div className="flex text-center justify-center items-center border-r-1 border-b-1 border-grey py-3">
                          {set.name}
                        </div>
                        <div className="flex justify-center items-center border-r-1 border-b-1 border-grey py-3">
                          {set.elo}
                        </div>
                        <div className="flex justify-center items-center border-r-1 border-b-1 border-grey py-3">
                          {setProgressMap[set.set_id]?.repeat_index ?? 0} /{" "}
                          {set.repeats}
                        </div>
                        <div className="flex justify-center items-center border-r-1 border-b-1 border-grey py-3">
                          {" "}
                          {setProgressMap[set.set_id]?.puzzle_index ?? 0} /{" "}
                          {set.size}
                        </div>

                        <div className="flex justify-center items-center border-r-1 border-b-1 border-grey py-3">
                          {setAccuracies[set.set_id] ? (
                            <>
                              {Math.round(
                                (setAccuracies[set.set_id].correct /
                                  (setAccuracies[set.set_id].correct +
                                    setAccuracies[set.set_id].incorrect || 1)) *
                                  100
                              )}
                              %
                            </>
                          ) : (
                            <>N/A</>
                          )}
                        </div>

                        {/* set selection buttons */}
                        <div className="flex flex-col md:flex-row w-full border-b border-grey ">
                          <Button
                            onClick={() => handleSetSelect(set.set_id)}
                            className="h-auto  py-0 gap-0 flex-1 rounded-none  md:border-r border-grey"
                            variant={
                              selectedSetId === set.set_id
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedSetId === set.set_id
                              ? "Selected"
                              : "Select"}
                          </Button>

                          <Button
                            className="h-auto py-0 gap-0 flex-1 rounded-none bg-red-500 hover:bg-red-900"
                            variant="destructive"
                            onClick={() => handleSetDelete(set.set_id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
