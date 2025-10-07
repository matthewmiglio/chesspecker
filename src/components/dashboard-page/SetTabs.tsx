"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <Tabs defaultValue={selectedSetId?.toString()} className="mb-8">
      <TabsList
        className={cn(
          "flex gap-2 overflow-x-auto scrollbar-hide px-1 w-full bg-muted/10"
        )}
        style={{
          scrollbarGutter: "stable",
        }}
      >
        {userSets.map((set) => {
          const isActive = selectedSetId === set.set_id;
          return (
            <TabsTrigger
              key={set.set_id}
              value={set.set_id.toString()}
              onClick={() => setSelectedSetId(set.set_id)}
              className={cn(
                "text-sm px-4 py-2 whitespace-nowrap  border transition-all duration-150",
                isActive
                  ? "text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted/30",
                "border",
                isActive ? "border-transparent" : "border-border"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${themeColor}20`,
                      boxShadow: `0 0 0 1px ${themeColor}, 0 0 8px ${themeColor}`,
                    }
                  : {}
              }
            >
              {set.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
