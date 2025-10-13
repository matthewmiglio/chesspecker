"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import CreateSetForm from "@/components/create-page/create-set-form";
import PuzzleSetCreationProgress from "@/components/create-page/set-creation-progress";
import { useToast } from "@/lib/hooks/useToast";

import { incrementUserSetCreate,incrementUserPuzzleRequests } from "@/lib/api/userStatsApi";

import { bumpDailyUsage } from "@/lib/api/usageApi";

import { createUserSet } from "@/lib/api/setsApi";
import { upsertAccuracy } from "@/lib/api/accuraciesApi";

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

  // Always use dark mode color
  const themeColor = "var(--red-progress-color)";


  const addNewSetToDatabase = async (
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

      // Phase 1: Puzzle Generation
      const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);

      if (!puzzleIds || puzzleIds.length === 0) {
        throw new Error('No puzzles were generated');
      }

      // Phase 2: Database Insertion using new secure API
      const setId = await createUserSet({
        name,
        elo,
        size,
        repeats,
        puzzleIds
      });

      if (!setId) {
        error("Failed to create puzzle set", "Creation Failed");
        setIsCreatingSet(false);
        return null;
      }

      // Phase 3: Accuracy Tracking Setup
      info("Setting up accuracy tracking...", undefined, 4000);

      // Create accuracy rows for each repeat index using the new RPC-based API
      for (let i = 0; i < repeats; i++) {
        try {
          const result = await upsertAccuracy({
            setId,
            repeatIndex: i,
            deltaCorrect: 0,
            deltaIncorrect: 0
          });

          if (!result) {
            error(`Failed to create accuracy tracking for repeat ${i + 1}`, "Accuracy Setup Failed");
          }
        } catch (accuracyErr) {
          const errorMessage =
            typeof accuracyErr === "object" && accuracyErr !== null && "message" in accuracyErr
              ? String((accuracyErr as { message?: unknown }).message)
              : String(accuracyErr);
          error(`Exception creating accuracy tracking for repeat ${i + 1}: ${errorMessage}`, "Accuracy Setup Error");
        }

        // Update progress UI
        const accuracyProgressPercent = Math.floor(((i + 1) / repeats) * 100);
        setAccuracyProgress(accuracyProgressPercent);
      }


      setIsCreatingSet(false);
      success(`"${name}" created successfully!`, "Puzzle Set Ready");
      return { set_id: setId };

    } catch (err) {
      setIsCreatingSet(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`Unexpected error in set creation: ${message}`, "Creation Failed");
      return null;
    }
  };

  const createNewPuzzleList = async (
    puzzle_count: number,
    targetElo: number,
    onProgress: (progress: number) => void
  ): Promise<string[]> => {
    if (puzzle_count > maxSetSize) {
      puzzle_count = maxSetSize;
    }

    try {
      const response = await fetch(
        `/api/puzzles/create-set?target=${targetElo}&size=${puzzle_count}&margin=100&tails_pct=0.10`
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data || !data.puzzles || !Array.isArray(data.puzzles)) {
        throw new Error(`Invalid puzzle data received: ${JSON.stringify(data)}`);
      }

      const puzzles = data.puzzles;
      const puzzleIds = puzzles.map((p: { PuzzleId: string }) => p.PuzzleId);

      onProgress(100);
      return puzzleIds;

    } catch (err) {
      throw err;
    }
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
    bumpDailyUsage({ set_creates: 1, puzzle_requests: setSize });
    incrementUserSetCreate();
    incrementUserPuzzleRequests(setSize);

    // Create the set
    const result = await addNewSetToDatabase(
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