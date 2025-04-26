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
  const maxSetSize = 200;
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = !!session?.user?.email;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [setSize, setSetSize] = useState<number>(300);
  const [repeatCount, setRepeatCount] = useState<number>(8);

  const [difficultySliderValue, setDifficultySliderValue] =
    useState<number>(1500);

  //progress bar popup vars
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [puzzleProgress, setPuzzleProgress] = useState(0);
  const [accuracyProgress, setAccuracyProgress] = useState(0);

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

  const addNewSetToDatabase = async (
    email: string,
    elo: number,
    size: number,
    repeats: number,
    name: string
  ) => {
    setIsCreatingSet(true);
    setPuzzleProgress(0);
    setAccuracyProgress(0);

    const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);
    const res = await fetch("/api/addSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, elo, size, repeats, name, puzzleIds }),
    });

    if (!res.ok) {
      console.error("Failed to add set:", res.status);
      setIsCreatingSet(false);
      return null;
    }

    const response = await res.json();
    const set = response.set;
    const setId = set.set_id;

    for (let i = 0; i < repeats; i++) {
      const success = await createSetAccuracy(setId, i);
      if (!success) {
        console.error("Failed to create accuracy row for repeat", i);
      }
      setAccuracyProgress(Math.floor(((i + 1) / repeats) * 100));
    }

    setIsCreatingSet(false);
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
    targetElo: number,
    onProgress: (progress: number) => void
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
      onProgress(Math.floor((puzzleIds.size / puzzle_count) * 100));
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

    const allPuzzleIds = Array.from(puzzleIds);
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

    await addNewSetToDatabase(
      email,
      difficultySliderValue,
      setSize,
      repeatCount,
      name
    );

    window.location.href = "/puzzles";
  };

  return (
    <div className="max-w-[90%] mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className=" pt-6 text-3xl font-bold mb-6">New Puzzle</h1>

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
              !isLoggedIn
                ? "blur-sm pointer-events-none opacity-50 "
                : "rounded-xl"
            }
          >
            <form className="" onSubmit={handleCreateSetButton}>
              <CardHeader className="pb-6">
                <CardTitle>Puzzle Set Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Set Name */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Set Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Tactical Puzzles"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A collection of tactical puzzles for intermediate players"
                  />
                </div>

                {/* Repeat Count */}
                <div className="space-y-1">
                  <Label htmlFor="repeat-count" className="text-sm font-medium">
                    Repeat Count
                  </Label>
                  <Input
                    id="repeat-count"
                    type="number"
                    value={repeatCount}
                    min={1}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                  />
                </div>

                {/* Set Size Slider */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Set Size</Label>
                  <Slider
                    value={[setSize]}
                    min={1}
                    max={200}
                    step={1}
                    onValueChange={(value) => setSetSize(value[0])}
                  />
                  <p className="text-sm text-center text-muted-foreground mt-1">
                    {setSize} puzzles
                  </p>
                </div>

                {/* ELO Slider */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">ELO Target</Label>
                  <Slider
                    value={[difficultySliderValue]}
                    min={500}
                    max={2900}
                    step={50}
                    onValueChange={(value) =>
                      setDifficultySliderValue(value[0])
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1 pt-1">
                    <span>700</span>
                    <span>1400</span>
                    <span>2000</span>
                    <span>2700</span>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mt-1">
                    Targeting:{" "}
                    <span className="font-semibold">
                      {difficultySliderValue} ELO
                    </span>
                  </p>
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
        {isCreatingSet && (
          <div className=" text-black fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="w-md max-w-[90%] p-6 bg-white rounded-xl shadow-lg space-y-6">
              <h2 className="text-xl font-semibold text-center">
                Creating Puzzle Set...
              </h2>

              <div>
                <p className="text-sm font-medium">Generating Puzzles</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${puzzleProgress}%` }}
                  />
                </div>
                <p className="text-right text-xs mt-1">{puzzleProgress}%</p>
              </div>

              <div>
                <p className="text-sm font-medium">Creating Accuracy Rows</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${accuracyProgress}%` }}
                  />
                </div>
                <p className="text-right text-xs mt-1">{accuracyProgress}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
