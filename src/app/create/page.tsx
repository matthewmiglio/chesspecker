"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
    difficulties: string[],
    size: number,
    repeats: number,
    name: string
  ) => {
    const puzzleIds = await createNewPuzzleList(size, difficulties);
    console.log("addNewSetToDatabase()");
    console.log("puzzleIds:", puzzleIds);
    const res = await fetch("/api/addSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        difficulties,
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

  const createNewPuzzleList = async (
    puzzle_count: number,
    difficulties: string[]
  ): Promise<string[]> => {
    if (puzzle_count > maxSetSize) {
      console.log(
        "This set is too big. Please make it smaller. Max is",
        maxSetSize
      );
      console.log("Using max set size of", maxSetSize);
      puzzle_count = maxSetSize;
    }

    const puzzleIds: string[] = [];
    const difficultyCounts: Record<string, number> = {};

    for (let i = 0; i < puzzle_count; i++) {
      const randomIndex = Math.floor(Math.random() * difficulties.length);
      const randomDifficulty = difficulties[randomIndex];

      // Track difficulty count
      difficultyCounts[randomDifficulty] =
        (difficultyCounts[randomDifficulty] || 0) + 1;

      const puzzle = await createNewPuzzle(randomDifficulty);
      const puzzleId = puzzle.puzzle.id;

      console.log(
        `Created puzzle ${puzzleId} with difficulty: ${randomDifficulty}`
      );
      puzzleIds.push(puzzleId);
    }

    console.log("createNewPuzzleList() yields", puzzleIds);
    console.log("Difficulty breakdown:");
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
      console.log(`  ${difficulty}: ${count}`);
    });

    return puzzleIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedDifficulties.length === 0 ||
      name.trim() === "" ||
      description.trim() === "" ||
      setSize <= 0 ||
      repeatCount <= 0
    ) {
      console.log("Please fill out all the fields");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      console.error(
        "Skipping handleSubmit() in create set page. session?.user?.email is undefined."
      );
      return;
    }

    console.log("email:", email);
    console.log("This set name:", name);
    console.log("This set description:", description);
    console.log("This set size:", setSize);
    console.log("This set repeatCount:", repeatCount);
    console.log("This set difficulties:", selectedDifficulties);

    const addSetResponse = await addNewSetToDatabase(
      email,
      selectedDifficulties,
      setSize,
      repeatCount,
      name
    );

    console.log("add set response", addSetResponse);

    window.location.href = "/puzzles";
  };

  return (
    <div className = "max-w-[90%] mx-auto"><div className="max-w-3xl mx-auto">
      <h1 className=" pt-6 text-3xl font-bold mb-6">Create a New Puzzle Set</h1>

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
          <form onSubmit={handleSubmit}>
            <CardHeader className = "pb-6">
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

              <div className="space-y-3">
                <Label>Difficulty Levels</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["easiest", "easier", "normal", "harder", "hardest"].map(
                    (level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={
                          selectedDifficulties.includes(level)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleDifficultyToggle(level)}
                        className="w-full capitalize"
                      >
                        {level}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className = "pt-5">
              <Button type="submit" className=" mx-auto ml-auto">
                Create Puzzle Set
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div></div>
  );
}
