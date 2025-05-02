import { Eye, Puzzle as PuzzleIcon, Repeat as RepeatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AnimatedBoard from "@/components/puzzles/chess-board";
import { useEffect } from "react";
import { MoveLeft, MoveRight, FastForward } from "lucide-react";

type ChessBoardWrapperProps = {
  fen: string;
  solution: string[];
  solvedIndex: number;
  puzzleSession: {
    handleMove: (move: string, isCorrect: boolean) => Promise<void>;
    isSessionActive: boolean;
    handleStartSession: () => Promise<void>;
    setHintUsed: (used: boolean) => void;

    goBack: () => void;
    goForward: () => void;
    goToFront: () => void;
    currentMoveIndex: number;
    moveHistory: string[];
  };
  highlight: string | null;
  setHighlight: (highlight: string | null) => void;
  playerSide: "w" | "b";
  selectedSetId: number | null;
  setAccuracies: Record<number, { correct: number; incorrect: number }>;
  currentPuzzleIndex: number;
  currentRepeatIndex: number;
  selectedSet: {
    repeats: number;
    size: number;
  };
};

export default function ChessBoardWrapper({
  fen,
  solution,
  solvedIndex,
  puzzleSession,
  highlight,
  setHighlight,
  playerSide,
  selectedSetId,
  setAccuracies,
  currentPuzzleIndex,
  currentRepeatIndex,
  selectedSet,
}: ChessBoardWrapperProps) {
  useEffect(() => {
    if (selectedSetId && puzzleSession && !puzzleSession.isSessionActive) {
      console.log(
        "[ChessBoardWrapper] selectedSetId ready. Starting session..."
      );
      puzzleSession.handleStartSession();
    }
  }, [selectedSetId, puzzleSession]);

  return (
    <div className="mx-auto rounded-xl">
      <Card>
        <CardContent className="px-0 mx-auto">
          <div className="flex">
            <AnimatedBoard
              fen={fen}
              solution={solution}
              solvedIndex={solvedIndex}
              onMove={puzzleSession.handleMove}
              highlight={highlight}
              isSessionActive={puzzleSession.isSessionActive}
              sideOnBottom={playerSide}
            />
          </div>
        </CardContent>

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
                          setAccuracies[selectedSetId].incorrect || 1)) *
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
                onClick={() => {
                  const move = solution[solvedIndex];
                  if (move) {
                    setHighlight(move.slice(2));
                  } else {
                    setHighlight(null);
                  }
                  puzzleSession.setHintUsed(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Hint
              </Button>
            </div>
          </div>
        </CardFooter>
        <CardFooter className="px-4 pt-2 pb-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground font-medium rounded-md shadow-none"
              onClick={puzzleSession.goBack}
              disabled={puzzleSession.currentMoveIndex === 0}
            >
              <MoveLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground font-medium rounded-md shadow-none"
              onClick={puzzleSession.goForward}
              disabled={
                puzzleSession.currentMoveIndex >=
                puzzleSession.moveHistory.length - 1
              }
            >
              <MoveRight className="h-4 w-4 mr-1" />
              Forward
            </Button>
            <Button
              size="sm"
              className="bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground font-medium rounded-md shadow-none"
              onClick={puzzleSession.goToFront}
              disabled={
                puzzleSession.currentMoveIndex >=
                puzzleSession.moveHistory.length - 1
              }
            >
              <FastForward className="h-4 w-4 mr-1" />
              Front
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
