"use client";

import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import CreateSetForm from "@/components/create-page/create-set-form";
import PuzzleSetCreationProgress from "@/components/create-page/set-creation-progress";
import { useToast } from "@/lib/hooks/useToast";

import { incrementUserSetCreate,incrementUserPuzzleRequests } from "@/lib/api/userStatsApi";

import {
  incrementSetCreate,
  incrementPuzzleRequest,
} from "@/lib/api/dailyStatsApi";

export default function CreatePuzzleSetPage() {
  const maxSetSize = 500;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;
  const { success, error, info } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [setSize, setSetSize] = useState<number>(200);
  const [repeatCount, setRepeatCount] = useState<number>(8);
  const [difficultySliderValue, setDifficultySliderValue] =
    useState<number>(1500);

  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [puzzleProgress, setPuzzleProgress] = useState(0);
  const [accuracyProgress, setAccuracyProgress] = useState(0);

  const { resolvedTheme } = useTheme();
  const [themeColor, setThemeColor] = useState("var(--red-progress-color)");

  useEffect(() => {
    setThemeColor(
      resolvedTheme === "dark"
        ? "var(--red-progress-color)"
        : "var(--blue-progress-color)"
    );
  }, [resolvedTheme]);

  const createSetAccuracy = async (setId: number, repeat_index: number) => {
    try {
      const res = await fetch("/api/accuracy/createSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, repeat_index: repeat_index }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create accuracy row");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`Error setting up accuracy tracking: ${message}`, "Setup Failed");
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
    try {
      setIsCreatingSet(true);
      setPuzzleProgress(0);
      setAccuracyProgress(0);
      
      info("Creating puzzle set...", "Please wait", 6000);

      const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);
      const res = await fetch("/api/sets/addSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, elo, size, repeats, name, puzzleIds }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error (${res.status})`;
        error(`Failed to create puzzle set: ${errorMessage}`, "Creation Failed");
        setIsCreatingSet(false);
        return null;
      }

      const response = await res.json();
      const set = response.set;
      const setId = set.set_id;

      info("Setting up accuracy tracking...", undefined, 4000);

      for (let i = 0; i < repeats; i++) {
        setAccuracyProgress(Math.floor(((i + 1) / repeats) * 100));
      }

      setIsCreatingSet(false);
      success(`"${name}" created successfully!`, "Puzzle Set Ready");
      return set;
    } catch (err) {
      setIsCreatingSet(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`An unexpected error occurred while creating the puzzle set: ${message}`, "Creation Failed");
      return null;
    }
  };

  const createNewPuzzle = async (difficulty: string) => {
    const response = await fetch("/api/lichess/getPuzzles", {
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
      easiest: 1,
      easier: 999,
      normal: 1499,
      harder: 2249,
      hardest: 3001,
    };

    const difficulties = Object.keys(difficultyEloMap);

    if (puzzle_count > maxSetSize) {
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

    while (puzzleIds.size < puzzle_count) {
      const currentAvg = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

      const pool =
        currentAvg >= targetElo ? easierDifficulties : harderDifficulties;

      if (pool.length === 0) {
        break;
      }

      const selectedDifficulty = getRandom(pool);

      const puzzle = await createNewPuzzle(selectedDifficulty);
      const puzzleId = puzzle.puzzle.id;

      if (puzzleIds.has(puzzleId)) {
        continue;
      }

      puzzleIds.add(puzzleId);
      totalElo += difficultyEloMap[selectedDifficulty];
      difficultyCounts[selectedDifficulty] =
        (difficultyCounts[selectedDifficulty] || 0) + 1;
      onProgress(Math.floor((puzzleIds.size / puzzle_count) * 100));
    }

    const allPuzzleIds = Array.from(puzzleIds);
    const shuffledPuzzleIds = shuffleStringList(allPuzzleIds);
    return shuffledPuzzleIds;
  };

  const handleCreateSetButton = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (name.trim() === "") {
      error("Please enter a name for your puzzle set.", "Name Required");
      return;
    }

    if (setSize <= 0 || repeatCount <= 0) {
      error("Please ensure set size and repeat count are valid.", "Invalid Values");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      error("Please log in to create puzzle sets.", "Authentication Required");
      return;
    }

    // Track usage statistics
    incrementSetCreate();
    incrementPuzzleRequest(setSize);
    incrementUserSetCreate(email);
    incrementUserPuzzleRequests(email, setSize);

    // Create the set
    const result = await addNewSetToDatabase(
      email,
      difficultySliderValue,
      setSize,
      repeatCount,
      name
    );

    // Only redirect if creation was successful
    if (result) {
      setTimeout(() => {
        window.location.href = "/puzzles";
      }, 1500); // Give time to see success toast
    }
  };

  return (
    <div className="max-w-[90%] mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="pt-6 text-3xl font-bold mb-6"></h1>

        <div
          className="rounded-xl p-[2px] transition-all duration-300"
          style={{
            boxShadow: `0 0 12px ${themeColor}`,
            border: `3px solid ${themeColor}`,
            borderRadius: "1rem",
          }}
        >
          <Card
            className={
              !isLoggedIn
                ? "blur-sm pointer-events-none opacity-50"
                : "rounded-xl"
            }
          >
            <CreateSetForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              repeatCount={repeatCount}
              setRepeatCount={setRepeatCount}
              setSize={setSize}
              setSetSize={setSetSize}
              difficultySliderValue={difficultySliderValue}
              setDifficultySliderValue={setDifficultySliderValue}
              handleCreateSetButton={handleCreateSetButton}
            />
          </Card>
        </div>

        {isCreatingSet && (
          <PuzzleSetCreationProgress
            puzzleProgress={puzzleProgress}
            accuracyProgress={accuracyProgress}
          />
        )}
      </div>
    </div>
  );
}
