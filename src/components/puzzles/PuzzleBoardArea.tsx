"use client";

import SetFinishedGraphic from "@/components/puzzles/set-finished-graphic";
import ChessBoardWrapper from "@/components/puzzles/chess-board-wrapper";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import type { ReturnTypeUsePuzzleSession } from "@/lib/types";

type PuzzleBoardAreaProps = {
  selectedSet: ChessPeckerSet;
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
  resetKey: number;
  boardThemeIndex?: number;
  setBoardThemeIndex?: (index: number) => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean) => void;
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
  resetKey,
  boardThemeIndex,
  setBoardThemeIndex,
  soundEnabled,
  setSoundEnabled,
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

  // Convert to title case
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Truncate and title case the name
  const displayName = toTitleCase(
    selectedSet.name.length > 30
      ? selectedSet.name.substring(0, 30) + '...'
      : selectedSet.name
  );

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
          puzzleSetName={displayName}
          resetKey={resetKey}
          boardThemeIndex={boardThemeIndex}
          setBoardThemeIndex={setBoardThemeIndex}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      )}
    </div>
  );
}
