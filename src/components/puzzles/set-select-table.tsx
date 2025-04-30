"use client";

import { PuzzleSet } from "@/lib/types";
import { handleSetSelect } from "@/lib/hooks/usePuzzleData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

type SetSelectTableProps = {
  userSets: PuzzleSet[];
  setSelectedSetId: (id: number) => void;
  setPuzzleIds: (ids: string[]) => void;
  setCurrentRepeatIndex: (index: number) => void;
  setCurrentPuzzleIndex: (index: number) => void;
  setFen: (fen: string) => void;
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

  return (
    <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8">
      {sortedSets.map((set) => {
        const solvedPuzzles =
          (setProgressMap[set.set_id]?.repeat_index ?? 0) * set.size +
          (setProgressMap[set.set_id]?.puzzle_index ?? 0);
        const totalPuzzles = set.repeats * set.size;
        const progressPercent =
          totalPuzzles > 0 ? (solvedPuzzles / totalPuzzles) * 100 : 0;

        const isSelected = selectedSetId === set.set_id;

        let progressColor = "bg-red-500";
        if (progressPercent >= 80) {
          progressColor = "bg-green-500";
        } else if (progressPercent >= 40) {
          progressColor = "bg-yellow-400";
        }

        return (
          <div
            key={set.set_id}
            onClick={async () => {
              const setToSelect = userSets.find((s) => s.set_id === set.set_id);
              if (!setToSelect) return;

              await handleSetSelect(
                set.set_id,
                userSets,
                setSelectedSetId,
                setPuzzleIds,
                setCurrentRepeatIndex,
                setCurrentPuzzleIndex,
                setFen,
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
              "relative bg-card text-card-foreground rounded-2xl shadow-md p-5 hover:ring-2 hover:ring-primary hover:scale-105 transition-all cursor-pointer group",
              isSelected && "ring-2 ring-primary scale-105"
            )}
          >
            <div className="mb-4">
              <div className="text-lg font-bold mb-1 leading-tight line-clamp-2">
                {set.name}
              </div>
              <div className="text-sm text-muted-foreground">ELO {set.elo}</div>
            </div>

            {/*debug card object */}
            <div className="p-4">
              <Card className="bg-card bg-[#222] text-white border border-red-500">
                <div>🧪 Debug Card</div>
                <div>CSS var value:</div>
                <pre className="text-xs whitespace-pre-wrap break-words px-2">
                  {typeof window !== "undefined" &&
                    getComputedStyle(document.documentElement).getPropertyValue("--card")}
                </pre>
              </Card>
            </div>

            <div className="p-4">
              <div className="bg-red-500 text-white border border-blue-500 p-4 min-h-[100px] min-w-[100px]">
                🧪 Mobile Test Card
                <br />
                If you can see this on mobile, layout is fine.
              </div>
            </div>



            <Progress
              value={progressPercent}
              className="h-3 rounded-full bg-muted/50"
              barClassName={cn(progressColor)}
            />

            <div className="mt-3 text-xs text-muted-foreground">
              {solvedPuzzles} / {totalPuzzles} puzzles solved (
              {Math.round(progressPercent)}%)
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
