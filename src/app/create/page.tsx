"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreatePuzzleSetPage() {
  const maxSetSize = 100;
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = !!session?.user?.email;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [setSize, setSetSize] = useState<number>(300);
  const [repeatCount, setRepeatCount] = useState<number>(8);

  const [difficultySliderValue, setDifficultySliderValue] =
    useState<number>(1500);

  const createSetAccuracy = async (setId: number, repeat_index: number) => {
    console.log("createSetAccuracy()");
    console.log("setId", setId);

    try {
      const res = await fetch("/api/createSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeat_index }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create accuracy row");
      }

      console.log(`Created accuracy row for set ${setId}`);
      return true;
    } catch (err) {
      console.error("Error creating accuracy row:", err);
      return false;
    }
  };

  const handleDifficultyToggle = (level: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const addNewSetToDatabase = async (
    email: string,
    elo: number,
    size: number,
    repeats: number,
    name: string
  ) => {
    const puzzleIds = await createNewPuzzleList(size, elo);
    console.log("addNewSetToDatabase()");
    console.log("puzzleIds:", puzzleIds);
    const res = await fetch("/api/addSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        elo,
        size,
        repeats,
        name,
        puzzleIds,
      }),
    });

    if (!res.ok) {
      console.error("Failed to add set:", res.status);
      return null;
    }

    const response = await res.json();
    const set = response.set;
    console.log("set", set);
    const setId = set.set_id;
    console.log("This new set has an id of", setId);
    for (let i = 0; i < repeats; i++) {
      const success = await createSetAccuracy(setId, i);
      if (!success) {
        console.error("Failed to create accuracy row for repeat", i);
      }
    }
  };

  const createNewPuzzle = async (difficulty: string) => {
    const response = await fetch("/api/getPuzzles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    });
    return await response.json();
  };

  const shuffleStringList = (list: string[]) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const createNewPuzzleList = async (
    puzzle_count: number,
    targetElo: number
  ): Promise<string[]> => {
    const difficultyEloMap: Record<string, number> = {
      easiest: 499,
      easier: 999,
      normal: 1499,
      harder: 2249,
      hardest: 3001,
    };

    const difficulties = Object.keys(difficultyEloMap);

    if (puzzle_count > maxSetSize) {
      console.log("⚠️ Requested set size exceeds max. Capping to", maxSetSize);
      puzzle_count = maxSetSize;
    }

    const getRandom = (list: string[]) =>
      list[Math.floor(Math.random() * list.length)];

    const easierDifficulties = difficulties.filter(
      (d) => difficultyEloMap[d] < targetElo
    );
    const harderDifficulties = difficulties.filter(
      (d) => difficultyEloMap[d] >= targetElo
    );

    const puzzleIds: Set<string> = new Set();
    const difficultyCounts: Record<string, number> = {};
    let totalElo = 0;

    console.log("🔧 Starting puzzle generation...");
    console.log(`🎯 Target average ELO: ${targetElo}`);
    console.log(`📦 Total puzzles to generate: ${puzzle_count}`);

    while (puzzleIds.size < puzzle_count) {
      const currentAvg = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

      const pool =
        currentAvg >= targetElo ? easierDifficulties : harderDifficulties;

      if (pool.length === 0) {
        console.warn("⚠️ No suitable difficulty options based on target ELO.");
        break;
      }

      const selectedDifficulty = getRandom(pool);

      console.log(
        `➕ Adding puzzle ${
          puzzleIds.size + 1
        } of ${puzzle_count} — Chose "${selectedDifficulty}" (current avg: ${currentAvg.toFixed(
          2
        )})`
      );

      const puzzle = await createNewPuzzle(selectedDifficulty);
      const puzzleId = puzzle.puzzle.id;

      if (puzzleIds.has(puzzleId)) {
        console.log(
          `♻️ Duplicate detected for difficulty "${selectedDifficulty}". Retrying...`
        );
        continue;
      }

      puzzleIds.add(puzzleId);
      totalElo += difficultyEloMap[selectedDifficulty];
      difficultyCounts[selectedDifficulty] =
        (difficultyCounts[selectedDifficulty] || 0) + 1;
    }

    const finalAvg = totalElo / puzzleIds.size;

    console.log("\n✅ Puzzle generation complete!");
    console.log(`🎯 Target average ELO: ${targetElo}`);
    console.log("📈 Final Average ELO:", finalAvg.toFixed(2));
    console.log("📊 Difficulty Breakdown:");
    for (const diff of difficulties) {
      const count = difficultyCounts[diff] || 0;
      console.log(`   • ${diff.padEnd(8)}: ${count} puzzle(s)`);
    }

    const allPuzzleIds =  Array.from(puzzleIds);
    const shuffledPuzzleIds = shuffleStringList(allPuzzleIds);
    console.log("All puzzle IDs:", allPuzzleIds);
    console.log("Shuffled puzzle IDs:", shuffledPuzzleIds);
    return shuffledPuzzleIds;
  };

  const handleCreateSetButton = async (e: React.FormEvent) => {
    console.log();
    e.preventDefault();

    if (name.trim() === "" || setSize <= 0 || repeatCount <= 0) {
      console.log("Please fill out name size and repeat count");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      console.error(
        "Skipping handleCreateSetButton() in create set page. session?.user?.email is undefined!"
      );
      return;
    }

    console.log("email:", email);
    console.log("This set name:", name);
    console.log("This set description:", description);
    console.log("This set size:", setSize);
    console.log("This set repeatCount:", repeatCount);
    console.log("This slider value:", difficultySliderValue);

    await addNewSetToDatabase(
      email,
      difficultySliderValue,
      setSize,
      repeatCount,
      name
    );

    // window.location.href = "/puzzles";
  };

  return (
    <div className="max-w-[90%] mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className=" pt-6 text-3xl font-bold mb-6">
          Create a New Puzzle Set
        </h1>

        <div className="relative">
          {!isLoading && !isLoggedIn && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center text-muted-foreground text-xl font-semibold">
                Log in to create sets
              </div>
            </div>
          )}

          <Card
            className={
              !isLoggedIn ? "blur-sm pointer-events-none opacity-50" : ""
            }
          >
            <form onSubmit={handleCreateSetButton}>
              <CardHeader className="pb-6">
                <CardTitle>Puzzle Set Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Set Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Tactical Puzzles"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A collection of tactical puzzles for intermediate players"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="set-size">Set Size</Label>
                  <Input
                    id="set-size"
                    type="number"
                    value={setSize}
                    min={1}
                    onChange={(e) => setSetSize(Number(e.target.value))}
                  />
                </div>

                {/*Repeat count input*/}
                <div className="space-y-2">
                  <Label htmlFor="repeat-count">Repeat Count</Label>
                  <Input
                    id="repeat-count"
                    type="number"
                    value={repeatCount}
                    min={1}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                  />
                </div>

                {/*Difficulty slider*/}
                <div className="space-y-3">
                  <Label>ELO</Label>
                  <Slider
                    defaultValue={[1500]}
                    min={500}
                    max={2900}
                    step={50}
                    onValueChange={(value) => {
                      console.log("Slider value:", value[0]);
                      setDifficultySliderValue(value[0]);
                    }}
                  />
                  <div className="flex gap-4">
                    <div className="flex-1 flex items-center justify-center">
                      700
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      1400
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      2000
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      2700
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-5">
                <Button type="submit" className=" mx-auto ml-auto">
                  Create Puzzle Set
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
