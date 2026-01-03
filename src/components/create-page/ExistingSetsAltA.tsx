// ALT A: "Noir Elegance" - Deep black with subtle red accents, serif typography
"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";

type ExistingSetsProps = {
  sets: ChessPeckerSet[];
  isLoading: boolean;
  onDeleteSet: (setId: number) => void;
  isLoggedIn: boolean;
};

export default function ExistingSetsAltA({ sets, isLoading, onDeleteSet, isLoggedIn }: ExistingSetsProps) {
  if (isLoading) {
    return (
      <div className={`relative ${!isLoggedIn ? "blur-sm pointer-events-none opacity-50" : ""}`}>
        <div className="border border-red-500/20 p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-red-500/40" />
            <p className="text-red-500/60 text-xs uppercase tracking-[0.3em]">Your Collection</p>
          </div>
          <div className="animate-pulse text-neutral-500 text-center py-12">
            Loading your sets...
          </div>
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className={`relative ${!isLoggedIn ? "blur-sm pointer-events-none opacity-50" : ""}`}>
        <div className="border border-red-500/20 p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-red-500/40" />
            <p className="text-red-500/60 text-xs uppercase tracking-[0.3em]">Your Collection</p>
          </div>
          <div className="text-center py-16">
            <p className="text-neutral-500 text-sm mb-2">No puzzle sets yet</p>
            <p className="text-neutral-600 text-xs">Begin your journey by creating your first set</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${!isLoggedIn ? "blur-sm pointer-events-none opacity-50" : ""}`}>
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-red-500/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-red-500/30 pointer-events-none" />

      <div className="p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-red-500/40" />
            <p className="text-red-500/60 text-xs uppercase tracking-[0.3em]">Your Collection</p>
          </div>
          <span className="text-neutral-600 text-sm">{sets.length} Sets</span>
        </div>

        {/* Sets list */}
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
          {sets.map((set) => {
            const progressPercent = set.size > 0
              ? ((set.repeat_index * set.size + set.puzzle_index) / (set.repeats * set.size)) * 100
              : 0;

            return (
              <div
                key={set.set_id}
                className="group border-l-2 border-red-500/40 pl-6 py-4 hover:border-red-500 transition-colors duration-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-light tracking-tight mb-2">
                      {set.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>{set.elo} ELO</span>
                      <span className="text-red-500/40">|</span>
                      <span>{set.size} puzzles</span>
                      <span className="text-red-500/40">|</span>
                      <span>{set.repeats}x repeat</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-500"
                    onClick={() => onDeleteSet(set.set_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="relative h-[2px] bg-neutral-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-600">
                  <span>Repeat {set.repeat_index + 1} of {set.repeats}</span>
                  <span>{Math.round(progressPercent)}% complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
