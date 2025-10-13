"use client";

import { cn } from "@/lib/utils";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";

interface SetTabsProps {
  userSets: ChessPeckerSet[];
  selectedSetId: number | null;
  setSelectedSetId: (id: number) => void;
}

export default function SetTabs({
  userSets,
  selectedSetId,
  setSelectedSetId,
}: SetTabsProps) {
  const themeColor = useThemeAccentColor();

  // Adjust grid columns based on number of sets
  const gridColsClass =
    userSets.length === 1
      ? "grid-cols-1 max-w-xs"
      : userSets.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "w-full grid gap-4 mb-8",
        gridColsClass
      )}
    >
      {userSets.map((set) => {
        const isSelected = selectedSetId === set.set_id;

        return (
          <div
            key={set.set_id}
            onClick={() => setSelectedSetId(set.set_id)}
            className={cn(
              "relative bg-card text-card-foreground rounded-lg border-2 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer",
              isSelected && "ring-2 ring-offset-2"
            )}
            style={{
              borderColor: isSelected ? themeColor : "hsl(var(--border))",
              backgroundColor: isSelected
                ? `${themeColor}15`
                : "hsl(var(--card))",
              boxShadow: isSelected
                ? `0 0 20px ${themeColor}40`
                : undefined,
              ...(isSelected && {
                '--tw-ring-color': themeColor,
              } as React.CSSProperties),
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={cn(
                    "text-base font-bold leading-tight mb-1",
                    isSelected && "text-primary"
                  )}
                >
                  {set.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  ELO {set.elo}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {set.size} puzzles × {set.repeats} repeats
                </div>
              </div>
              <div className="text-2xl">
                {set.elo >= 1800 ? "🔥" : set.elo >= 1400 ? "⚡" : "🧩"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
