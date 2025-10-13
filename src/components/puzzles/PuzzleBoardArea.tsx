"use client";

import SetFinishedGraphic from "@/components/puzzles/set-finished-graphic";
import ChessBoardWrapper from "@/components/puzzles/chess-board-wrapper";
import { PuzzleSet } from "@/lib/types";
import type { ReturnTypeUsePuzzleSession } from "@/lib/types";

type PuzzleBoardAreaProps = {
  selectedSet: PuzzleSet;
  selectedSetId: number | null;
  selectedSetIsDone: boolean;
  fen: string;
  solution: string[];
  solvedIndex: number;
  puzzleSession: ReturnTypeUsePuzzleSession;
  highlight: string | null;
  setHighlight: (highlight: string | null) => void;
  playerSide: "w" | "b";
  setAccuracies: Record<number, { correct: number; incorrect: number }>;
  currentPuzzleIndex: number;
  currentRepeatIndex: number;
  puzzleIds: string[];
  autoShowSolution: boolean;
  setAutoShowSolution: (value: boolean) => void;
  isLoading?: boolean;
};

export default function PuzzleBoardArea({
  selectedSet,
  selectedSetId,
  selectedSetIsDone,
  fen,
  solution,
  solvedIndex,
  puzzleSession,
  highlight,
  setHighlight,
  playerSide,
  setAccuracies,
  currentPuzzleIndex,
  currentRepeatIndex,
  puzzleIds,
  autoShowSolution,
  setAutoShowSolution,
  isLoading = false,
}: PuzzleBoardAreaProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-pulse text-muted-foreground text-center">
          <div className="text-lg mb-2">Loading puzzle board...</div>
        </div>
      </div>
    );
  }

  return (
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
          setAccuracies={setAccuracies}
          currentPuzzleIndex={currentPuzzleIndex}
          currentRepeatIndex={currentRepeatIndex}
          selectedSet={selectedSet}
          selectedSetId={selectedSetId}
          puzzleIds={puzzleIds}
          autoShowSolution={autoShowSolution}
          setAutoShowSolution={setAutoShowSolution}
        />
      )}
    </div>
  );
}
