"use client";

import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
import { Eye } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ChessBoard } from "@/components/chess-board";

type PuzzleSet = {
  set_id: number;
  name: string;
  user_id: string;
  difficulties: string[];
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
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [solution, setSolution] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [sessionAccuracy, setSessionAccuracy] = useState<number>(0);
  const [sessionCompletedPuzzles, setSessionCompletedPuzzles] =
    useState<number>(0);
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);

  const addIncorrectAttempt = async (setId: number, repeatIndex: number) => {
    console.log("addIncorrectAttempt()");
    console.log("-setId", setId);
    console.log("-repeatIndex", repeatIndex);
    try {
      const res = await fetch("/api/addIncorrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to add incorrect attempt");

      console.log(
        "Added incorrect attempt for set",
        setId,
        "repeat",
        repeatIndex
      );
      return true;
    } catch (err) {
      console.error("Error adding incorrect attempt:", err);
      return false;
    }
  };

  const addCorrectAttempt = async (setId: number, repeatIndex: number) => {
    console.log("addCorrectAttempt()");
    console.log("-setId", setId);
    console.log("-repeatIndex", repeatIndex);
    try {
      const res = await fetch("/api/addCorrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to add correct attempt");

      console.log(
        "Added correct attempt for set",
        setId,
        "repeat",
        repeatIndex
      );
      return true;
    } catch (err) {
      console.error("Error adding correct attempt:", err);
      return false;
    }
  };

  const fetchUserSetData = async () => {
    const response = await fetch("/api/getSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: sessionStorage.getItem("user_id") }),
    });
    const result = await response.json();
    console.log("fetchUserSetData() response:", response);
    console.log("fetchUserSetData() result:", result);
    setUserSets(result.sets);
  };

  useEffect(() => {
    fetchUserSetData();
  }, []);

  const getSetAccuracy = async (setId: number, repeatIndex: number) => {
    try {
      const res = await fetch("/api/getSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeatIndex }),
      });

      console.log("getSetAccuracy() response", res);

      const data = await res.json();
      console.log("getSetAccuracy() data", data);

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch accuracy stats");

      console.log(
        `Accuracy stats for set ${setId} repeat ${repeatIndex}:`,
        data
      );
      return { correct: data.correct, incorrect: data.incorrect };
    } catch (err) {
      console.error("Error fetching set accuracy:", err);
      return null;
    }
  };

  const updateSessionAccuracy = async () => {
    console.log("updateSessionAccuracy()");
    console.log("-selectedSetId", selectedSetId);
    console.log("-currentRepeatIndex", currentRepeatIndex);
    if (!selectedSetId || (!currentRepeatIndex && currentRepeatIndex != 0)) {
      console.log(
        "There is no set id or no currentRepeatIndex so cant update accuracy"
      );
      console.log("selectedSetId", selectedSetId);
      console.log("currentRepeatIndex", currentRepeatIndex);
      return;
    }
    const accuracy = await getSetAccuracy(selectedSetId, currentRepeatIndex);
    console.log("accuracy", accuracy);
    if (accuracy) {
      const totalAttempts = accuracy.correct + accuracy.incorrect;
      setSessionCompletedPuzzles(totalAttempts);
      console.log("Updated sessionCompletedPuzzles with:", totalAttempts);
      if (totalAttempts > 0) {
        const accuracyPercentage = (accuracy.correct / totalAttempts) * 100;
        setSessionAccuracy(accuracyPercentage);
        console.log("Just set session accuracy to:", accuracyPercentage);
      } else {
        console.log("No attempts. Setting accuracy to 0%.");
        setSessionAccuracy(0);
      }
    } else console.log("No accuracy data found for this set.");
  };

  const updatePuzzleProgress = async () => {
    console.log("updatePuzzleProgress()");

    if (!selectedSetId) {
      console.log("No set selected so cant update puzzle progress!");
      return;
    }

    var { repeat_index, puzzle_index, size, repeats } = await getSetProgress(
      selectedSetId
    );

    console.log("setCurrentPuzzleIndex() to puzzle_index:", puzzle_index);
    console.log("setCurrentRepeatIndex() to repeat_index:", repeat_index);
    setCurrentPuzzleIndex(puzzle_index);
    setCurrentRepeatIndex(repeat_index);
  };

  const handleStartSession = async () => {
    console.log("handleStartSession()");
    setIsSessionActive(true);
    if (!selectedSetId) {
      console.log("no selected session so cant handle session start");
      return;
    }
    await updateSessionAccuracy();
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

      console.log("Set deleted successfully:", setId);
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

    console.log(
      `Replaying ${Math.min(
        initialPly - 1,
        history.length
      )} moves to reach puzzle state...`
    );

    // Replay up to (but not including) the move at initialPly
    for (let i = 0; i < initialPly && i < history.length; i++) {
      const move = history[i];
      replay.move(move);
    }

    console.log("Board at FEN setup:");
    console.log(replay.ascii());

    return replay.fen();
  };

  const setIsDone = () => {
    const set = userSets.find((s) => s.set_id === selectedSetId);
    if (!set) return false;
    console.log("setIsDone()");
    console.log("set.repeats", set.repeats);
    console.log("currentRepeatIndex", currentRepeatIndex);
    if (currentRepeatIndex === set.repeats) {
      console.log("This set is done. No more puzzles to solve.");
      return true;
    }
    console.log("This set is apparently not done. Keeping on solving...");
    return false;
  };

  const logVerboseSolution = (solution: string[], fen: string) => {
    const chess = new Chess(fen);
    solution.forEach((uci, i) => {
      const move = {
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci.slice(4) : undefined,
      };
      const piece = chess.get(move.from as Square);
      if (!piece) {
        console.warn(`Move ${uci} references empty square.`);
        return;
      }

      const colorName = piece.color === "w" ? "White" : "Black";
      const typeMap: Record<string, string> = {
        p: "pawn",
        n: "knight",
        b: "bishop",
        r: "rook",
        q: "queen",
        k: "king",
      };

      const desc = `${colorName} ${typeMap[piece.type]} ${move.from} to ${
        move.to
      }`;
      console.log(`Step ${i + 1}: ${desc}`);
      chess.move(move); // advance state
    });
  };

  const selectedSet = userSets.find((s) => s.set_id === selectedSetId);

  const getPuzzleData = async (puzzleId: string) => {
    console.log("Retrieving this puzzle ID#", puzzleId);
    const response = await fetch(`/api/getPuzzleById?id=${puzzleId}`);
    if (!response.ok) return null;
    return await response.json();
  };

  const loadPuzzleAndInitialize = async (puzzleData: PuzzleData) => {
    console.log("Initializing puzzle:", puzzleData);

    const fen = getFenAtPly(
      puzzleData.game.pgn,
      puzzleData.puzzle.initialPly + 1
    );
    setFen(fen);
    setSolution(puzzleData.puzzle.solution);
    setSolvedIndex(0);
    setHighlight(null);
    logVerboseSolution(puzzleData.puzzle.solution, fen);

    console.log("Puzzleid", puzzleData.puzzle.id);
    console.log("Initializing fen:", fen);
    console.log("This is the solution:", puzzleData.puzzle.solution);
    console.log("initial play is:", puzzleData.puzzle.initialPly);
    console.log("fen is:", puzzleData.puzzle.initialPly);
  };

  const handleSetSelect = async (setId: number) => {
    console.log("handleSetSelect()");
    console.log("selected this set id:", setId);
    setSelectedSetId(setId);
    console.log('Updated session with "selected_set_id":', setId);
    setIsSessionActive(false);
    sessionStorage.setItem("selected_set_id", String(setId));
    const set = userSets.find((s) => s.set_id === setId);

    if (
      !set ||
      !set.difficulties ||
      !set.size ||
      (!set.puzzle_index && set.puzzle_index != 0)
    )
      return;

    const currentIndex = set.puzzle_index;

    console.log("the puzzle index is at:", currentIndex);
    const puzzleIds = set.puzzle_ids;
    setPuzzleIds(puzzleIds);
    console.log("updated puzzle ids with", puzzleIds);
    const puzzleId = puzzleIds[currentIndex];
    const puzzle = await getPuzzleData(puzzleId);
    console.log("puzzleId", puzzleId);
    console.log("puzzle", puzzle);
    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
    }
  };

  const incrementPuzzleIndex = async () => {
    const setId = selectedSetId;
    console.log("Incrementing puzzle index");

    if (!setId) {
      console.log("No set selected so cant handleNextPuzzle()!");
      return;
    }
    const currentSetProgress = await getSetProgress(selectedSetId);
    console.log("This user's set progress:", currentSetProgress);
    if (!currentSetProgress) {
      console.log("No set progress found for this user.");
      return;
    }
    var { repeat_index, puzzle_index, size, repeats } = currentSetProgress;

    if (puzzle_index + 1 == size) {
      (puzzle_index = 0), repeat_index++;
    } else {
      puzzle_index++;
    }

    await setSetProgress(setId, repeat_index, puzzle_index);

    setCurrentPuzzleIndex(puzzle_index);
    setCurrentRepeatIndex(repeat_index); //insert set incrementing logic here

    return puzzle_index;
  };

  const puzzleIsFinished = () => {
    if (solution.length + 1 == solvedIndex) {
      console.log("Puzzle is finished. Moving to next puzzle.");
      return true;
    } else {
      console.log("Puzzle isn't finished. Not moving to next puzzle.");
      return false;
    }
  };

  const handleNextPuzzle = async () => {
    console.log("handleNextPuzzle():");
    console.log("-solution", solution);
    console.log("-solvedIndex", solvedIndex);
    console.log("-isSessionActive", isSessionActive);
    console.log("-Soluition length is", solution.length);

    if (setIsDone()) {
      console.log("This set is done. No more puzzles to solve.");
      showConfetti();
      return;
    }

    if (!puzzleIsFinished) {
      console.log("Puzzle isn't finished. Not moving to next puzzle.");
      return;
    }

    console.log("this puzzle index is", currentPuzzleIndex);
    const puzzleIndex = await incrementPuzzleIndex();
    console.log("incremented puzzle index to", puzzleIndex);
    const puzzleId = puzzleIds[puzzleIndex];
    console.log("Here is the puzzle id were about to load", puzzleId);
    const puzzle = await getPuzzleData(puzzleId);

    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
      console.log("Successfully loaded the next puzzle");
    } else {
      console.log("Failed to load the next puzzle");
    }

    await updateSessionAccuracy();
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

  const handleIncorrectMove = async () => {
    console.log("handleIncorrectMove()");
    const setId = selectedSetId;
    if (!setId) {
      console.log("No set selected so cant handle invalid move!");
      return;
    }
    await addIncorrectAttempt(selectedSetId, currentRepeatIndex);
    await updateSessionAccuracy();
    await handleNextPuzzle();
  };

  const handleSuccessfulPuzzle = async () => {
    console.log("Handle puzzle solution logic here!");
    const setId = selectedSetId;
    if (!setId) {
      console.log("No set selected so cant handle puzzle solution move!");
      return;
    }
    await addCorrectAttempt(selectedSetId, currentRepeatIndex);
    await updateSessionAccuracy();
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

  const showSparkles = () => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.4 },
      colors: ["#00FF9C", "#b9fbc0", "#00FFC8"],
      scalar: 1.2,
    });
  };

  const dropEmoji = (emoji: string = "🥳") => {
    const div = document.createElement("div");
    div.innerText = emoji;
    div.className =
      "fixed top-0 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce z-[1000]";
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 1200);
  };

  const flashRedScreen = () => {
    const flash = document.createElement("div");
    flash.className =
      "fixed inset-0 bg-red-500 opacity-50 animate-fade z-[999]";
    document.body.appendChild(flash);

    setTimeout(() => {
      document.body.removeChild(flash);
    }, 100);
  };

  const handleMove = (move: string, isCorrect: boolean) => {
    console.log("handleMove():", move, "isCorrect:", isCorrect);
    if (!isSessionActive) return;

    if (!isCorrect) {
      console.log("User made an incorrect move!");
      showRedX();
      handleIncorrectMove();
      return;
    }

    // ✅ Correct move logic
    showGreenCheck();
    console.log("User made the correct move!");
    setSolvedIndex((i) => i + 2);
    console.log("User just inputted solution move #:", solvedIndex + 1);
    const chess = new Chess();

    //make the computer move after the solution move
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

    //check for puzzle completion
    if (solvedIndex + 1 === solution.length) {
      console.log("User just solved the puzzle! 🎉");
      handleSuccessfulPuzzle();
    } else {
      console.log("There's still more puzzle to do!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Puzzle Sets</h1>
        <Button asChild>
          <Link href="/create">Create New Set</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Sets</h2>
          {userSets.map((set) => (
            <Card
              key={set.set_id}
              className={`cursor-pointer transition-all ${
                selectedSetId === set.set_id ? "border-primary" : ""
              }`}
              onClick={() => handleSetSelect(set.set_id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{set.name}</CardTitle>
                <CardDescription>
                  Difficulties: {set.difficulties.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {set.difficulties.map((diff) => (
                    <Badge key={diff} variant="secondary">
                      {diff}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Set: {currentRepeatIndex} / {set.repeats}
                </div>
                <div className="text-sm text-muted-foreground">
                  Puzzle: {currentPuzzleIndex + 1} / {set.size}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedSetId === set.set_id ? "default" : "outline"}
                >
                  {selectedSetId === set.set_id ? "Selected" : "Select"}
                </Button>
              </CardFooter>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={removeSetGivenId(set.set_id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedSet ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedSet.name}</CardTitle>
                  <CardDescription>
                    Solve puzzles to improve your skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <ChessBoard
                      fen={fen}
                      solution={solution}
                      solvedIndex={solvedIndex}
                      onMove={handleMove}
                      highlight={highlight}
                      isSessionActive={isSessionActive}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Session accuracy: {sessionAccuracy}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Puzzles solved: {sessionCompletedPuzzles}/
                      {selectedSet.size}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        handleStartSession();
                      }}
                    >
                      Start Session
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setHighlight(solution[solvedIndex]?.slice(2) ?? null)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Show Solution
                    </Button>
                    {/* <Button onClick={() => handleNextPuzzle()}>
                      Next Puzzle
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border rounded-lg bg-muted/20">
              <div className="text-center p-8">
                <h3 className="text-xl font-medium mb-2">
                  No Puzzle Set Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select a puzzle set from the left to start solving
                </p>
                <Button variant="outline" asChild>
                  <Link href="/create">Create Your Own Set</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
