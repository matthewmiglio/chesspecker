
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
  repeat_number: number;
  puzzle_number: number;
};

export default function PuzzlesPage() {
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [fen, setFen] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [solution, setSolution] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [solvedIndex, setSolvedIndex] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserSetData = async () => {
      const response = await fetch("/api/getSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: sessionStorage.getItem("user_id") }),
      });
      const result = await response.json();
      setUserSets(result.sets || []);
      console.log('fetchUserSetData() response:', response)
      console.log('fetchUserSetData() result:', result)
    };
    fetchUserSetData();

  }, []);

  const getFenAtPly = (pgn: string, initialPly: number) => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history({ verbose: true }).slice(0, initialPly - 1); // 👈 Fix here
    const replay = new Chess();
    for (const move of history) replay.move(move);
    return replay.fen();
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
        p: "pawn", n: "knight", b: "bishop",
        r: "rook", q: "queen", k: "king",
      };

      const desc = `${colorName} ${typeMap[piece.type]} ${move.from} to ${move.to}`;
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

  const handleSetSelect = async (setId: number) => {
    console.log('selected this set id:', setId)
    setSelectedSetId(setId);
    setIsSessionActive(false);
    sessionStorage.setItem("selected_set_id", String(setId));
    const set = userSets.find((s) => s.set_id === setId);
    if (!set || !set.difficulties || !set.size || !set.puzzle_number) return;

    const currentIndex = set.puzzle_number;
    if (set.puzzle_ids.length < set.size) {
      console.log('still generating new puzzles for this set')
      const randomDiff = set.difficulties[Math.floor(Math.random() * set.difficulties.length)];
      const puzzle = await generateNewPuzzle(randomDiff);
      const puzzleId = puzzle.puzzle.id;
      await addPuzzleIdToSetGivenId(setId, puzzleId);
      console.log('initial play is:', puzzle.puzzle.initialPly)
      const fen = getFenAtPly(puzzle.game.pgn, puzzle.puzzle.initialPly);
      setFen(fen);
      logVerboseSolution(puzzle.puzzle.solution, fen);
      setSolution(puzzle.puzzle.solution);
      setSolvedIndex(0);
      setHighlight(null);
    } else {
      console.log('done generating new puzzles for this set. loading an existing puzzle')
      console.log('the puzzle index is at:', currentIndex)
      const puzzleId = set.puzzle_ids[currentIndex - 1];
      const puzzle = await getPuzzleData(puzzleId);
      if (puzzle) {
        const fen = getFenAtPly(puzzle.game.pgn, puzzle.puzzle.initialPly);
        setFen(fen);
        setSolution(puzzle.puzzle.solution);
        setSolvedIndex(0);
        setHighlight(null);
        console.log('initial play is:', puzzle.puzzle.initialPly)
        logVerboseSolution(puzzle.puzzle.solution, fen);


      }
    }
  };

  const handleMove = (move: string) => {
    console.log('handling this move:', move);
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
      if (computerMove) chess.move({ from: computerMove.slice(0, 2), to: computerMove.slice(2) });
      setFen(chess.fen());
    } else {
      const chess = new Chess(fen);
      const piece = chess.get(move.slice(0, 2) as Square);
      const color = piece?.color === "w" ? "White" : "Black";
      const typeMap: Record<string, string> = {
        p: "pawn", n: "knight", b: "bishop",
        r: "rook", q: "queen", k: "king",
      };
      const type = piece ? typeMap[piece.type] : "unknown piece";
      const from = move.slice(0, 2);
      const to = move.slice(2, 4);
      console.warn(`User tried ${color} ${type} ${from} → ${to} but that's incorrect.`);
      console.log(`User tried ${color} ${type} ${from} → ${to} but that's incorrect.`);
      alert("❌ Incorrect move. Try again.");
    }
  };


  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Puzzle Sets</h1>
        <Button asChild><Link href="/create">Create New Set</Link></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Sets</h2>
          {userSets.map((set) => (
            <Card key={set.set_id}
              className={`cursor-pointer transition-all ${selectedSetId === set.set_id ? "border-primary" : ""}`}
              onClick={() => handleSetSelect(set.set_id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{set.name}</CardTitle>
                <CardDescription>Difficulties: {set.difficulties.join(", ")}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {set.difficulties.map((diff) => (
                    <Badge key={diff} variant="secondary">{diff}</Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Set: {set.repeat_number} / {set.repeats}
                </div>
                <div className="text-sm text-muted-foreground">
                  Puzzles: {set.puzzle_number} / {set.size}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={selectedSetId === set.set_id ? "default" : "outline"}>
                  {selectedSetId === set.set_id ? "Selected" : "Select"}
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
                  <CardDescription>Solve puzzles to improve your skills</CardDescription>
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
                    <p className="text-sm text-muted-foreground">Session accuracy: 0%</p>
                    <p className="text-sm text-muted-foreground">Puzzles solved: {Math.floor(solvedIndex / 2)}/{selectedSet.size}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsSessionActive(true)}>Start Session</Button>
                    <Button variant="ghost" onClick={() => setHighlight(solution[solvedIndex]?.slice(2) ?? null)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Solution
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border rounded-lg bg-muted/20">
              <div className="text-center p-8">
                <h3 className="text-xl font-medium mb-2">No Puzzle Set Selected</h3>
                <p className="text-muted-foreground mb-4">Select a puzzle set from the left to start solving</p>
                <Button variant="outline" asChild><Link href="/create">Create Your Own Set</Link></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
