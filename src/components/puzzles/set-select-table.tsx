"use client";

import { PuzzleSet } from "@/lib/types";
import { handleSetSelect } from "@/lib/utils/puzzleHelpers";
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
  isLoading?: boolean;
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
  isLoading = false,
}: SetSelectTableProps) {
  const { data: session } = useSession();
  const email = session?.user?.email || "unauthenticated@email.com";

  if (isLoading) {
    return (
      <div className="w-[90%] ml-[5%] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative bg-card text-card-foreground rounded-lg border-2 p-6 animate-pulse"
            >
              <div className="mb-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-2 bg-muted rounded-full mb-3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (userSets.length === 0) {
    return null;
  }

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
        "w-[90%] ml-[5%] grid gap-6 py-8",
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

        // Color scheme matching stats window style
        const progressColor =
          progressPercent >= 80
            ? "rgb(34, 197, 94)" // green
            : progressPercent >= 60
            ? "rgb(59, 130, 246)" // blue
            : progressPercent >= 40
            ? "rgb(234, 179, 8)" // yellow
            : progressPercent >= 20
            ? "rgb(239, 68, 68)" // red
            : "rgb(168, 85, 247)"; // purple (for very low progress)

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
              "relative bg-card text-card-foreground rounded-lg border-2 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer",
              isSelected && "shadow-[0_0_25px_rgba(234,179,8,0.9)]"
            )}
            style={{
              borderColor: progressColor,
              backgroundColor: `${progressColor}15`,
            }}
          >
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="text-base font-bold leading-tight line-clamp-2 flex-1">
                  {set.name}
                </div>
                <span className="text-lg ml-2">
                  {set.elo >= 1200 ? "🔥" : "🧩"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">ELO {set.elo}</div>
            </div>

            <Progress
              value={progressPercent}
              className="h-2 rounded-full bg-muted/50"
              barClassName=""
              style={{ backgroundColor: progressColor }}
            />

            <div className="mt-3 text-xs text-muted-foreground">
              {solvedPuzzles} / {totalPuzzles} ({Math.round(progressPercent)}%)
            </div>

            <div className="flex justify-end mt-4">
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
