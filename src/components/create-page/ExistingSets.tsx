"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";

type ExistingSetsProps = {
  sets: ChessPeckerSet[];
  isLoading: boolean;
  onDeleteSet: (setId: number) => void;
};

export default function ExistingSets({ sets, isLoading, onDeleteSet }: ExistingSetsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Existing Sets</CardTitle>
          <CardDescription>
            Review your current puzzle sets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-muted-foreground py-8 text-center">
            Loading your sets...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Existing Sets</CardTitle>
          <CardDescription>
            Review your current puzzle sets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center text-sm">
            <p className="mb-2">You haven&apos;t created any puzzle sets yet.</p>
            <p>Create your first one to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Existing Sets ({sets.length})</CardTitle>
        <CardDescription>
          Review your current puzzle sets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="space-y-3">
            {sets.map((set) => {
              const progressPercent = set.size > 0
                ? ((set.repeat_index * set.size + set.puzzle_index) / (set.repeats * set.size)) * 100
                : 0;

              return (
                <div
                  key={set.set_id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-1">
                        {set.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">ELO:</span>
                          {set.elo}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Size:</span>
                          {set.size}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Repeats:</span>
                          {set.repeats}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="text-xl">
                        {set.elo >= 1800 ? "🔥" : set.elo >= 1400 ? "⚡" : "🧩"}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSet(set.set_id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Repeat {set.repeat_index + 1} of {set.repeats} • Puzzle {set.puzzle_index + 1} of {set.size}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
