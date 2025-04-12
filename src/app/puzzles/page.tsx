"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AnimatedBoard from "@/components/chess-board";
import { useSession } from "next-auth/react";

type PuzzleSet = {
  set_id: number;
  name: string;
  user_id: string;
  elo: number;
  size: number;
  repeats: number;
  puzzle_ids: string[];
  repeat_index: number;
  puzzle_index: number;
};

type PuzzleData = {
  puzzle: Puzzle;
  game: Game;
};

type Puzzle = {
  id: string;
  initialPly: number;
  solution: string[];
  set_id: number;
  repeat_index: number;
  puzzle_index: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type Game = {
  pgn: string;
};

export default function PuzzlesPage() {
  const { data: session, status: authStatus } = useSession();

  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [solution, setSolution] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
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

  useEffect(() => {
    const fetchUserSetData = async () => {
      console.log("fetchUserSetData()");

      if (!session?.user?.email) {
        console.error("User is not logged in or session is missing email");
        return;
      }

      const response = await fetch("/api/getSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) {
        console.error("Failed to fetch user sets");
        return;
      }

      console.log("Valid /api/getSet response");

      const result = await response.json();
      const sets: PuzzleSet[] = result.sets;
      setUserSets(sets);

      const accuracies: Record<number, { correct: number; incorrect: number }> =
        {};
      const progressMap: Record<
        number,
        { repeat_index: number; puzzle_index: number }
      > = {};

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
      fetchUserSetData();
    }
  }, [authStatus]);

  const getSetAccuracy = async (setId: number, repeatIndex: number) => {
    try {
      const res = await fetch("/api/getSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch accuracy stats");

      return { correct: data.correct, incorrect: data.incorrect };
    } catch (err) {
      console.error("Error fetching set accuracy:", err);
      return null;
    }
  };

  const updatePuzzleProgress = async () => {
    if (!selectedSetId) {
      return;
    }
    const currentSetProgress = await getSetProgress(selectedSetId);
    if (!currentSetProgress) {
      return;
    }
    const repeat_index = currentSetProgress.repeat_index;
    if (!repeat_index) {
      return;
    }
    setCurrentRepeatIndex(repeat_index);
  };

  const handleStartSession = async () => {
    console.log("handleStartSession()");
    setIsSessionActive(true);
    if (!selectedSetId) {
      return;
    }
    await updatePuzzleProgress();
  };

  const removeSetGivenId = (setId: number) => async () => {
    try {
      const res = await fetch("/api/removeSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete set");
    } catch (err) {
      console.error("Error deleting set:", err);
    }

    setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
    if (selectedSetId === setId) {
      setSelectedSetId(null);
    }
    sessionStorage.removeItem("selected_set_id");
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
    setSelectedSetId(setId);
    setIsSessionActive(false);
    sessionStorage.setItem("selected_set_id", String(setId));
    const set = userSets.find((s) => s.set_id === setId);

    if (
      !set ||
      !set.elo ||
      !set.size ||
      (!set.puzzle_index && set.puzzle_index != 0)
    )
      return;

    const currentIndex = set.puzzle_index;

    const puzzleIds = set.puzzle_ids;
    setPuzzleIds(puzzleIds);
    const puzzleId = puzzleIds[currentIndex];
    const puzzle = await getPuzzleData(puzzleId);
    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
    }
    handleStartSession();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const incrementPuzzleIndex = async () => {
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

    setCurrentRepeatIndex(repeat_index);

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

    showRedX(); // still show the ❌
    await addIncorrectAttempt(setId, currentRepeatIndex);

    await showSolution(); // 👈 show the correct answer before progressing
    await handleNextPuzzle();
  };

  const handleSuccessfulPuzzle = async () => {
    const setId = selectedSetId;
    if (!setId) {
      return;
    }
    await addCorrectAttempt(selectedSetId, currentRepeatIndex);
    await handleNextPuzzle();
  };

  const showConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const showGreenCheck = () => {
    const div = document.createElement("div");
    div.innerText = "✅";
    div.className =
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-6xl animate-ping z-[1000]";
    document.body.appendChild(div);

    setTimeout(() => {
      document.body.removeChild(div);
    }, 1000);
  };

  const showRedX = () => {
    const div = document.createElement("div");
    div.innerText = "❌";
    div.className =
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl animate-ping z-[1000]";
    document.body.appendChild(div);

    setTimeout(() => {
      document.body.removeChild(div);
    }, 1000);
  };

  const handleMove = (move: string, isCorrect: boolean) => {
    if (!isSessionActive) return;

    if (!isCorrect) {
      showRedX();
      handleIncorrectMove();
      return;
    }

    showGreenCheck();
    setSolvedIndex((i) => i + 2);
    const chess = new Chess();

    chess.load(fen);
    chess.move(move);

    const computerMove = solution[solvedIndex + 1];
    if (computerMove) {
      chess.move({
        from: computerMove.slice(0, 2),
        to: computerMove.slice(2),
      });
    }

    setFen(chess.fen());

    if (solvedIndex + 1 === solution.length) {
      handleSuccessfulPuzzle();
    } else {
    }
  };

  return (
    <div className="mx-auto">
      {selectedSet ? (
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
            <CardFooter className="px-0">
              {/*accuracy*/}
              <div className="px-3 text-sm text-muted-foreground">
                Accuracy:
                {selectedSetId !== null && setAccuracies[selectedSetId]
                  ? ` ${Math.round(
                      (setAccuracies[selectedSetId].correct /
                        (setAccuracies[selectedSetId].correct +
                          setAccuracies[selectedSetId].incorrect || 1)) *
                        100
                    )}%`
                  : " N/A"}
              </div>

              {/*puzzle index / size*/}
              <div className="px-3 flex gap-4 text-sm text-muted-foreground">
                <div className="px-1">
                  <PuzzleIcon className="w-4 h-4" />
                </div>{" "}
                {selectedSet.puzzle_index + 1} / {selectedSet.size}
              </div>

              {/*repeat index / repeat count*/}
              <div className="px-3 flex gap-4 text-sm text-muted-foreground">
                <div className="px-1">
                  <RepeatIcon className="w-4 h-4" />
                </div>{" "}
                {currentRepeatIndex + 1} / {selectedSet.repeats}
              </div>

              {/*show hint*/}
              <div className="flex">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setHighlight(solution[solvedIndex]?.slice(2) ?? null)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Hint
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="mx-auto flex items-center justify-center  h-full min-h-[400px] border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-xl font-medium mb-2">No Puzzle Set Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a puzzle set from the left to start solving
            </p>
            <Button variant="outline" asChild>
              <Link href="/create">Create Your Own Set</Link>
            </Button>
          </div>
        </div>
      )}

      {/*User sets*/}
      <div className=" grid grid-cols-1 ">
        <div className="border  rounded-t-lg bg-black">
          <div className="text-xs grid grid-cols-6 ">
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
              Puzzle #
            </div>
            <div className=" py-2 flex justify-center items-center border-r-1 border-grey">
              Accuracy
            </div>
            <div> </div>
          </div>
        </div>

        <div className=" border rounded-b-lg bg-muted/20">
          {userSets.map((set) => (
            <div key={set.set_id} className="">
              <Card
                key={set.set_id}
                className={`cursor-pointer bg-transparent transition-all py-0 ${
                  selectedSetId === set.set_id ? "border-primary" : ""
                }`}
                onClick={() => handleSetSelect(set.set_id)}
              >
                <div className="text-xs grid grid-cols-6 rounded-2xl">
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
                    {(setProgressMap[set.set_id]?.puzzle_index ?? 0) + 1} /{" "}
                    {set.size}
                  </div>
                  {setAccuracies[set.set_id] && (
                    <div className="flex justify-center items-center border-r-1 border-b-1 border-grey py-3">
                      {" "}
                      {Math.round(
                        (setAccuracies[set.set_id].correct /
                          (setAccuracies[set.set_id].correct +
                            setAccuracies[set.set_id].incorrect || 1)) *
                          100
                      )}
                      %
                    </div>
                  )}
                {/* set selection buttons */}
<div className="flex flex-col md:flex-row sm:gap-4 justify-end items-center border-r border-b border-grey">
  <div className="flex w-full md:w-auto">
    <Button
      className="w-full px-0 sm:px-5 rounded-none"
      variant={selectedSetId === set.set_id ? "default" : "outline"}
    >
      {selectedSetId === set.set_id ? "Selected" : "Select"}
    </Button>
  </div>

  <div className="flex w-full md:w-auto justify-end">
    <Button
      className="w-full px-0 sm:px-5 rounded-none"
      variant="destructive"
      onClick={() => removeSetGivenId(set.set_id)}
    >
      Delete
    </Button>
  </div>
</div>





                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
