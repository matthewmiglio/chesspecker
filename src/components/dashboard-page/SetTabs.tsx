"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PuzzleSet } from "@/lib/types";

interface SetTabsProps {
  userSets: PuzzleSet[];
  selectedSetId: number | null;
  setSelectedSetId: (id: number) => void;
}

export default function SetTabs({
  userSets,
  selectedSetId,
  setSelectedSetId,
}: SetTabsProps) {
  return (
    <Tabs defaultValue={selectedSetId?.toString()} className="mb-8">
      <TabsList className="flex flex-wrap gap-2">
        {userSets.map((set) => (
          <TabsTrigger
            key={set.set_id}
            value={set.set_id.toString()}
            onClick={() => setSelectedSetId(set.set_id)}
            className={cn(
              "text-sm px-3 py-1",
              selectedSetId === set.set_id && "border border-primary"
            )}
          >
            {set.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
