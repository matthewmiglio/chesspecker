"use client";

import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string>("");

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

  const handleStartSession = async () => {
    console.log("handleStartSession()");
    setIsSessionActive(true);
    if (!selectedSetId) {
      console.log("no selected session so cant handle session start");
      return;
    }
    var { repeat_index, puzzle_index, size, repeats } = await getSetProgress(
      selectedSetId
    );

    setCurrentPuzzleIndex(puzzle_index);
    setCurrentRepeatIndex(repeat_index);
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
      // optionally refresh or update state here
    } catch (err) {
      console.error("Error deleting set:", err);
    }

    //if the set is deleted, remove it from the userSets state
    setUserSets((prevSets) => prevSets.filter((set) => set.set_id !== setId));
    //if the set is deleted, remove it from the selectedSetId state
    if (selectedSetId === setId) {
      setSelectedSetId(null);
    }
    //if the set is deleted, remove it from the sessionStorage
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
      const color = move.color === "w" ? "White" : "Black";
      const piece = move.piece;
      const from = move.from;
      const to = move.to;
      const promotion = move.promotion
        ? ` promoting to ${move.promotion.toUpperCase()}`
        : "";

      // console.log(
      //   `Move ${
      //     i + 1
      //   }: ${color} ${piece.toUpperCase()} ${from} → ${to}${promotion}`
      // );

      replay.move(move);
    }

    console.log("Board at FEN setup:");
    console.log(replay.ascii());

    return replay.fen();
  };

  const setIsDone = () => {
    const set = userSets.find((s) => s.set_id === selectedSetId);
    if (!set) return false;
    if (currentRepeatIndex > set.repeats) {
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

  const generateNewPuzzle = async (difficulty: string) => {
    const response = await fetch("/api/getPuzzles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    });
    return await response.json();
  };

  const getPuzzleData = async (puzzleId: string) => {
    console.log("Retrieving this puzzle ID#", puzzleId);
    const response = await fetch(`/api/getPuzzleById?id=${puzzleId}`);
    if (!response.ok) return null;
    return await response.json();
  };

  const addPuzzleIdToSetGivenId = async (setId: number, puzzle_id: string) => {
    await fetch("/api/addPuzzleToSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id: setId, puzzle_id }),
    });
  };

  const loadPuzzleAndInitialize = async (puzzle: PuzzleData) => {
    console.log("Initializing puzzle:", puzzle);

    const fen = getFenAtPly(puzzle.game.pgn, puzzle.puzzle.initialPly + 1);
    setFen(fen);
    setSolution(puzzle.puzzle.solution);
    setSolvedIndex(0);
    setHighlight(null);
    logVerboseSolution(puzzle.puzzle.solution, fen);

    console.log("Puzzleid", puzzle.puzzle.id);
    console.log("Initializing fen:", fen);
    console.log("This is the solution:", puzzle.puzzle.solution);
    console.log("initial play is:", puzzle.puzzle.initialPly);
    console.log("fen is:", puzzle.puzzle.initialPly);
  };

  const handleSetSelect = async (setId: number) => {
    console.log("handleSetSelect()");
    console.log("selected this set id:", setId);
    setSelectedSetId(setId);
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

    if (set.puzzle_ids.length < set.size) {
      console.log("still generating new puzzles for this set");
      const randomDiff =
        set.difficulties[Math.floor(Math.random() * set.difficulties.length)];
      const puzzle = await generateNewPuzzle(randomDiff);
      const puzzleId = puzzle.puzzle.id;
      await addPuzzleIdToSetGivenId(setId, puzzleId);
      await loadPuzzleAndInitialize(puzzle);
    } else {
      console.log(
        "done generating new puzzles for this set. loading an existing puzzle"
      );
      console.log("the puzzle index is at:", currentIndex);
      const puzzleId = set.puzzle_ids[currentIndex];
      const puzzle = await getPuzzleData(puzzleId);

      console.log("puzzleId", puzzleId);
      console.log("puzzle", puzzle);
      if (puzzle) {
        await loadPuzzleAndInitialize(puzzle);
      }
    }
  };

  const getPuzzleSize = () => {
    const set = userSets.find((s) => s.set_id === selectedSetId);
    if (!set) return 0;
    return set.size;
  };

  const getLoadedPuzzleCount = () => {
    const set = userSets.find((s) => s.set_id === selectedSetId);
    if (!set) return 0;
    return set.puzzle_ids.length;
  };

  const shouldLoadPuzzle = () => {
    if (getLoadedPuzzleCount() < getPuzzleSize()) {
      console.log("Loading new puzzle...");
      return true;
    } else {
      console.log("No new puzzle to load.");
      return false;
    }
  };

  const generateAndAddPuzzle = async (setId: number) => {
    console.log("Generating then adding a new puzzle to this set...");
    const set = userSets.find((s) => s.set_id === setId);
    if (!set) return;
    const randomDiff =
      set.difficulties[Math.floor(Math.random() * set.difficulties.length)];
    const puzzle = await generateNewPuzzle(randomDiff);
    const puzzleId = puzzle.puzzle.id;
    setCurrentPuzzleId(puzzleId);
    console.log(
      "just updated current puzzle id to this new puzzle id:",
      puzzleId
    );
    await addPuzzleIdToSetGivenId(setId, puzzleId);
    console.log("Just added a puzzle to this sets list: puzzle ID:", puzzleId);
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
    console.log(
      "########################   NEXT PUZZLE   ########################"
    );
    console.log(
      "########################   NEXT PUZZLE   ########################"
    );
    console.log(
      "########################   NEXT PUZZLE   ########################"
    );
    console.log("handleNextPuzzle():");
    console.log("-solution", solution);
    console.log("-solvedIndex", solvedIndex);
    console.log("-isSessionActive", isSessionActive);
    console.log("-Soluition length is", solution.length);

    if (setIsDone()) {
      console.log("This set is done. No more puzzles to solve.");
      alert("This set is done. No more puzzles to solve.");
      return;
    }

    if (!puzzleIsFinished) {
      console.log("Puzzle isn't finished. Not moving to next puzzle.");
      return;
    }

    if (shouldLoadPuzzle()) {
      console.log("Before moving to next puzzle, loading a new one...");
      await generateAndAddPuzzle(selectedSetId!);
      await fetchUserSetData();
    } else {
      console.log("No new puzzle to load before moving to next puzzle");
    }
    console.log("this puzzle index is", currentPuzzleIndex);
    const puzzleIndex = await incrementPuzzleIndex();
    console.log("incremented puzzle index to", puzzleIndex);
    console.log("Here is the puzzle id were about to load", currentPuzzleId);
    const puzzle = await getPuzzleData(currentPuzzleId);

    if (puzzle) {
      await loadPuzzleAndInitialize(puzzle);
      console.log("Successfully loaded the next puzzle");
    } else {
      console.log("Failed to load the next puzzle");
    }
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

  const handleMove = (move: string) => {
    console.log("handling this move:", move);
    if (!isSessionActive) return;

    if (move === "invalid") {
      console.warn("User attempted an invalid move.");
      return alert("Invalid move.");
    }

    if (move === solution[solvedIndex]) {
      setSolvedIndex((i) => i + 2);
      const chess = new Chess();
      chess.load(fen);
      chess.move(move);
      const computerMove = solution[solvedIndex + 1];
      if (computerMove)
        chess.move({
          from: computerMove.slice(0, 2),
          to: computerMove.slice(2),
        });
      setFen(chess.fen());
      console.log("User just inputted solution move #:", solvedIndex + 1);
    } else {
      const chess = new Chess(fen);
      const piece = chess.get(move.slice(0, 2) as Square);
      const color = piece?.color === "w" ? "White" : "Black";
      const typeMap: Record<string, string> = {
        p: "pawn",
        n: "knight",
        b: "bishop",
        r: "rook",
        q: "queen",
        k: "king",
      };
      const type = piece ? typeMap[piece.type] : "unknown piece";
      const from = move.slice(0, 2);
      const to = move.slice(2, 4);
      console.warn(
        `User tried ${color} ${type} ${from} → ${to} but that's incorrect.`
      );
      console.log(
        `User tried ${color} ${type} ${from} → ${to} but that's incorrect.`
      );
      alert("❌ Incorrect move. Try again.");
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
                  Puzzles: {currentPuzzleIndex} / {set.size}
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
                      Session accuracy: 0%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Puzzles solved: {Math.floor(solvedIndex / 2)}/
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
                    <Button onClick={() => handleNextPuzzle()}>
                      Next Puzzle
                    </Button>
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
