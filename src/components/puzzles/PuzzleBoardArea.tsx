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
}: PuzzleBoardAreaProps) {
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
        />
      )}
    </div>
  );
}
