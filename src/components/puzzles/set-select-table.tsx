"use client";

import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import { handleSetSelect } from "@/lib/utils/puzzleHelpers";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

const getProgressColor = (percent: number) => {
  if (percent >= 75) return "rgb(34, 197, 94)";
  if (percent >= 50) return "rgb(234, 179, 8)";
  if (percent >= 25) return "rgb(249, 115, 22)";
  return "rgb(239, 68, 68)";
};

type SetSelectTableProps = {
  userSets: ChessPeckerSet[];
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative bg-zinc-900 border-l-4 border-zinc-700 p-5 animate-pulse"
            >
              <div className="mb-3">
                <div className="h-5 bg-zinc-800 w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-800 w-1/2"></div>
              </div>
              <div className="h-1.5 bg-zinc-800 mb-3"></div>
              <div className="h-3 bg-zinc-800 w-2/3"></div>
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
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";

  return (
    <div
      className={cn(
        "w-[90%] ml-[5%] grid gap-3 py-8",
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
        const color = getProgressColor(progressPercent);

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
              "relative bg-zinc-900 border-l-4 p-5 cursor-pointer transition-all duration-200 hover:bg-zinc-850",
              isSelected && "bg-zinc-800"
            )}
            style={{ borderColor: isSelected ? "#10b981" : color }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-200 uppercase tracking-wider truncate font-mono">
                    {set.name}
                  </span>
                  <span className="text-sm flex-shrink-0">{set.elo >= 1200 ? "🔥" : "🧩"}</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600 font-mono mt-1">
                  ELO {set.elo}
                </p>
              </div>
              <button
                className="p-1 text-zinc-700 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetDelete(set.set_id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-zinc-800 mb-3">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, backgroundColor: color }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 font-mono">
                {solvedPuzzles} / {totalPuzzles}
              </span>
              <span className="text-sm font-bold font-mono" style={{ color }}>
                ({Math.round(progressPercent)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
