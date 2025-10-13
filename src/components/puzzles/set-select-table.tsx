"use client";

import { PuzzleSet } from "@/lib/types";
import { handleSetSelect } from "@/lib/hooks/usePuzzleData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

type SetSelectTableProps = {
  userSets: PuzzleSet[];
  setSelectedSetId: (id: number) => void;
  setPuzzleIds: (ids: string[]) => void;
  setCurrentRepeatIndex: (index: number) => void;
  setCurrentPuzzleIndex: (index: number) => void;
  setFen: (fen: string) => void;
  setStartingFen: (fen: string) => void;
  setSolution: (solution: string[]) => void;
  setSolvedIndex: (index: number) => void;
  setHighlight: (highlight: string | null) => void;
  setPlayerSide: (side: "w" | "b") => void;
  setProgressMap: Record<
    number,
    { repeat_index: number; puzzle_index: number }
  >;
  setAccuracies: Record<number, { correct: number; incorrect: number }>;
  puzzleSession: { handleStartSession: () => Promise<void> };
  handleSetDelete: (id: number) => void;
  selectedSetId: number | null;
};

export default function SetSelectTable({
  userSets,
  setSelectedSetId,
  setPuzzleIds,
  setCurrentRepeatIndex,
  setCurrentPuzzleIndex,
  setFen,
  setStartingFen,
  setSolution,
  setSolvedIndex,
  setHighlight,
  setPlayerSide,
  setProgressMap,
  puzzleSession,
  handleSetDelete,
  selectedSetId,
}: SetSelectTableProps) {
  const sortedSets = [...userSets].sort((a, b) => {
    const aSolved =
      (setProgressMap[a.set_id]?.repeat_index ?? 0) * a.size +
      (setProgressMap[a.set_id]?.puzzle_index ?? 0);
    const bSolved =
      (setProgressMap[b.set_id]?.repeat_index ?? 0) * b.size +
      (setProgressMap[b.set_id]?.puzzle_index ?? 0);
    const aTotal = a.repeats * a.size;
    const bTotal = b.repeats * b.size;
    const aPercent = aTotal > 0 ? aSolved / aTotal : 0;
    const bPercent = bTotal > 0 ? bSolved / bTotal : 0;
    return aPercent - bPercent;
  });

  const { data: session } = useSession();
  const email = session?.user?.email || "unauthenticated@email.com";

  // Adjust grid columns based on number of sets
  const gridColsClass =
    sortedSets.length === 1
      ? "grid-cols-1 max-w-xs"
      : sortedSets.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "w-[90%] mx-auto grid gap-4 py-8",
        gridColsClass
      )}
    >
      {sortedSets.map((set) => {
        const solvedPuzzles =
          (setProgressMap[set.set_id]?.repeat_index ?? 0) * set.size +
          (setProgressMap[set.set_id]?.puzzle_index ?? 0);
        const totalPuzzles = set.repeats * set.size;
        const progressPercent =
          totalPuzzles > 0 ? (solvedPuzzles / totalPuzzles) * 100 : 0;

        const isSelected = selectedSetId === set.set_id;

        // Brighter, more varied colors based on progress
        const progressColor =
          progressPercent >= 80
            ? "#22c55e" // Bright green
            : progressPercent >= 60
            ? "#3b82f6" // Bright blue
            : progressPercent >= 40
            ? "#f59e0b" // Bright amber/orange
            : progressPercent >= 20
            ? "#ef4444" // Bright red
            : "#8b5cf6"; // Bright purple (for very low progress)

        const progressColorStyle = {
          backgroundColor: progressColor,
        };

        return (
          <div
            key={set.set_id}
            onClick={async () => {
              const setToSelect = userSets.find((s) => s.set_id === set.set_id);
              if (!setToSelect) return;

              await handleSetSelect(
                email,
                set.set_id,
                userSets,
                setSelectedSetId,
                setPuzzleIds,
                setCurrentRepeatIndex,
                setCurrentPuzzleIndex,
                setFen,
                setStartingFen,
                setSolution,
                setSolvedIndex,
                setHighlight,
                setPlayerSide,
                setToSelect
              );

              const setIsDone = setToSelect.repeat_index >= setToSelect.repeats;
              if (!setIsDone) {
                await puzzleSession.handleStartSession();
              }
            }}
            className={cn(
              "relative bg-card text-card-foreground rounded-xl shadow-md p-4 hover:scale-[1.02] transition-all cursor-pointer group",
              isSelected && "ring-[2px] ring-offset-2 ring-offset-background"
            )}
          >
            <div className="mb-3">
              <div className="text-base font-bold mb-1 leading-tight line-clamp-2">
                {set.name}
              </div>
              <div className="text-xs text-muted-foreground">ELO {set.elo}</div>
            </div>
            <span className="absolute top-2 right-2 text-lg opacity-60">
              {set.elo >= 1200 ? "🔥" : "🧩"}
            </span>

            <Progress
              value={progressPercent}
              className="h-2 rounded-full bg-muted/50"
              barClassName=""
              style={progressColorStyle}
            />

            <div className="mt-2 text-xs text-muted-foreground">
              {solvedPuzzles} / {totalPuzzles} ({Math.round(progressPercent)}%)
            </div>

            <div className="flex justify-end mt-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetDelete(set.set_id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
