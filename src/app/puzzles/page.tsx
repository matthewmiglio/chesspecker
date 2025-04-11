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
import AnimatedBoard from "@/components/chess-board";
import { useSession } from "next-auth/react";

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
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [sessionAccuracy, setSessionAccuracy] = useState<number>(0);
  const [sessionCompletedPuzzles, setSessionCompletedPuzzles] =
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

    console.log("Getting accuracies for sets...");
    for (const set of sets) {
      console.log("Getting accuracies for set id:", set.set_id);
      console.log("This set is on repeat index:", set.repeat_index);
      console.log("This set size is ", set.size);

      var repeat_index = set.repeat_index;
      if (repeat_index == set.size) {
        console.log("This set is finished so getting prev repeat index");
        set.repeat_index--;
      }

      // Accuracy per set
      const res = await getSetAccuracy(set.set_id, set.repeat_index);
      if (res) {
        accuracies[set.set_id] = res;
      }

      // Progress per set
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

  useEffect(() => {
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

  const updateSessionAccuracy = async () => {
    if (!selectedSetId || (!currentRepeatIndex && currentRepeatIndex != 0)) {
      return;
    }
    const accuracy = await getSetAccuracy(selectedSetId, currentRepeatIndex);
    if (accuracy) {
      const totalAttempts = accuracy.correct + accuracy.incorrect;
      setSessionCompletedPuzzles(totalAttempts);
      if (totalAttempts > 0) {
        const accuracyPercentage = (accuracy.correct / totalAttempts) * 100;
        setSessionAccuracy(accuracyPercentage);
      } else {
        setSessionAccuracy(0);
      }
    }
  };

  const updatePuzzleProgress = async () => {
    if (!selectedSetId) {
      return;
    }

    var { repeat_index, puzzle_index, size, repeats } = await getSetProgress(
      selectedSetId
    );

    setCurrentPuzzleIndex(puzzle_index);
    setCurrentRepeatIndex(repeat_index);
  };

  const handleStartSession = async () => {
    console.log("handleStartSession()");
    setIsSessionActive(true);
    if (!selectedSetId) {
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
      chess.move(move);
    });
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
    logVerboseSolution(puzzleData.puzzle.solution, fen);

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
      !set.difficulties ||
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
    var { repeat_index, puzzle_index, size, repeats } = currentSetProgress;

    if (puzzle_index + 1 == size) {
      (puzzle_index = 0), repeat_index++;
    } else {
      puzzle_index++;
    }

    await setSetProgress(setId, repeat_index, puzzle_index);

    setCurrentPuzzleIndex(puzzle_index);
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
    const setId = selectedSetId;
    if (!setId) {
      return;
    }
    await addIncorrectAttempt(selectedSetId, currentRepeatIndex);
    await updateSessionAccuracy();
    await handleNextPuzzle();
  };

  const handleSuccessfulPuzzle = async () => {
    const setId = selectedSetId;
    if (!setId) {
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
                  Set: {setProgressMap[set.set_id]?.repeat_index ?? 0} /{" "}
                  {set.repeats}
                </div>

                <div className="text-sm text-muted-foreground">
                  Puzzle: {(setProgressMap[set.set_id]?.puzzle_index ?? 0) + 1}{" "}
                  / {set.size}
                </div>

                {setAccuracies[set.set_id] && (
                  <div className="text-sm text-muted-foreground">
                    Accuracy:{" "}
                    {Math.round(
                      (setAccuracies[set.set_id].correct /
                        (setAccuracies[set.set_id].correct +
                          setAccuracies[set.set_id].incorrect || 1)) *
                        100
                    )}
                    %
                  </div>
                )}
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
                <CardFooter className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
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
