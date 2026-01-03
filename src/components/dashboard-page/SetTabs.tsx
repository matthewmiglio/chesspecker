"use client";

import { cn } from "@/lib/utils";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";

interface SetTabsProps {
  userSets: ChessPeckerSet[];
  selectedSetId: number | null;
  setSelectedSetId: (id: number) => void;
}

export default function SetTabs({ userSets, selectedSetId, setSelectedSetId }: SetTabsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
      {userSets.map((set) => {
        const isSelected = selectedSetId === set.set_id;
        return (
          <div
            key={set.set_id}
            onClick={() => setSelectedSetId(set.set_id)}
            className={cn(
              "relative rounded-none p-5 cursor-pointer transition-all duration-200",
              "bg-zinc-900 border-l-4 hover:bg-zinc-850",
              isSelected ? "border-l-emerald-500 bg-zinc-800" : "border-l-zinc-700"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  "font-bold text-sm uppercase tracking-wider",
                  isSelected ? "text-emerald-400" : "text-zinc-300"
                )}>
                  {set.name}
                </h4>
                <span className="text-lg">{set.elo >= 1800 ? "🔥" : set.elo >= 1400 ? "⚡" : "🧩"}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className={cn(
                  "font-mono",
                  isSelected ? "text-emerald-500" : "text-zinc-500"
                )}>
                  {set.elo}
                </span>
                <span className="text-zinc-600">{set.size}p × {set.repeats}r</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
