"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import CreateSetForm from "@/components/create-page/create-set-form";
import PuzzleSetCreationProgress from "@/components/create-page/set-creation-progress";
import ExistingSets from "@/components/create-page/ExistingSets";
import { useToast } from "@/lib/hooks/useToast";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import { PUZZLE_THEMES_OVER_10K } from "@/lib/constants/puzzleThemes";

import { incrementUserSetCreate,incrementUserPuzzleRequests } from "@/lib/api/userStatsApi";

import { bumpDailyUsage } from "@/lib/api/usageApi";

import { getUserSets, createUserSet, deleteUserSet } from "@/lib/api/setsApi";
import { upsertAccuracy } from "@/lib/api/accuraciesApi";
import { showConfirmDeletePopup } from "@/components/puzzles/ConfirmDeletePopup";

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
  const [selectedThemes, setSelectedThemes] = useState<string[]>([...PUZZLE_THEMES_OVER_10K]);

  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [puzzleProgress, setPuzzleProgress] = useState(0);
  const [accuracyProgress, setAccuracyProgress] = useState(0);

  const [userSets, setUserSets] = useState<ChessPeckerSet[]>([]);
  const [isSetsLoading, setIsSetsLoading] = useState(true);

  // Fetch user's existing sets
  useEffect(() => {
    const fetchSets = async () => {
      if (!isLoggedIn) {
        setIsSetsLoading(false);
        return;
      }

      try {
        const sets = await getUserSets();
        setUserSets(sets);
      } catch (err) {
        console.error("Error fetching user sets:", err);
      } finally {
        setIsSetsLoading(false);
      }
    };

    fetchSets();
  }, [isLoggedIn]);

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
      const puzzleIds = await createNewPuzzleList(size, elo, selectedThemes, setPuzzleProgress);

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
    themes: string[],
    onProgress: (progress: number) => void,
    retryCount = 0
  ): Promise<string[]> => {
    if (puzzle_count > maxSetSize) {
      puzzle_count = maxSetSize;
    }

    const maxRetries = 1;
    const retryDelay = 1000; // 1 second

    try {
      // Build themes query parameter
      const themesParam = themes.length > 0 ? themes.join(',') : PUZZLE_THEMES_OVER_10K.join(',');
      const url = `/api/puzzles/create-set?target=${targetElo}&size=${puzzle_count}&margin=100&tails_pct=0.10&themes=${themesParam}`;

      console.log('[createNewPuzzleList] Requesting puzzles:', {
        target: targetElo,
        size: puzzle_count,
        margin: 100,
        tails_pct: 0.10,
        themes: themes.length > 0 ? themes : PUZZLE_THEMES_OVER_10K,
        retryCount
      });

      const response = await fetch(url);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text().catch(() => 'No response body') };
        }

        console.error('[createNewPuzzleList] API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          params: { target: targetElo, size: puzzle_count, themes }
        });

        // Handle timeout (504) or server errors (5xx) with retry
        if ((response.status === 504 || response.status >= 500) && retryCount < maxRetries && errorData.retryable !== false) {
          const suggestion = errorData.suggestion || 'Try again in a moment';
          info(`Request timed out. ${suggestion}`, "Retrying...", 3000);

          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
          return createNewPuzzleList(puzzle_count, targetElo, themes, onProgress, retryCount + 1);
        }

        // Handle theme validation errors
        if (response.status === 400 && errorData.allowedThemes) {
          throw new Error(`${errorData.error}`);
        }

        throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('[createNewPuzzleList] API response:', {
        puzzlesCount: data.puzzles?.length,
        target: data.target,
        size: data.size,
        themes: data.themes,
        ms: data.ms
      });

      if (!data || !data.puzzles || !Array.isArray(data.puzzles)) {
        throw new Error(`Invalid puzzle data received: ${JSON.stringify(data)}`);
      }

      const puzzles = data.puzzles;
      const puzzleIds: string[] = puzzles.map((p: { PuzzleId: string }) => p.PuzzleId);

      // Deduplicate puzzle IDs
      const uniquePuzzleIds: string[] = Array.from(new Set(puzzleIds));

      if (uniquePuzzleIds.length < puzzleIds.length) {
        console.warn('[createNewPuzzleList] Removed duplicate puzzles:', {
          original: puzzleIds.length,
          unique: uniquePuzzleIds.length,
          duplicatesRemoved: puzzleIds.length - uniquePuzzleIds.length
        });
      }

      // Enforce 500 puzzle cap
      if (uniquePuzzleIds.length > 500) {
        console.warn('[createNewPuzzleList] Capping puzzles at 500:', {
          original: uniquePuzzleIds.length,
          capped: 500
        });
        info("Puzzle set capped at 500 puzzles", "Note", 4000);
        onProgress(100);
        return uniquePuzzleIds.slice(0, 500);
      }

      // Display success summary
      const themesStr = themes.length > 3
        ? `${themes.slice(0, 3).join(', ')}... (+${themes.length - 3} more)`
        : themes.join(', ');

      console.log('[createNewPuzzleList] Success:', {
        puzzles: uniquePuzzleIds.length,
        themes: themesStr,
        timeMs: data.ms
      });

      onProgress(100);
      return uniquePuzzleIds;

    } catch (err) {
      console.error('[createNewPuzzleList] Exception:', {
        error: err instanceof Error ? err.message : String(err),
        params: { target: targetElo, size: puzzle_count, themes },
        retryCount
      });
      throw err;
    }
  };

  const handleSetDelete = async (setId: number) => {
    const confirmed = await showConfirmDeletePopup();
    if (!confirmed) return;

    const success = await deleteUserSet(setId);

    if (success) {
      setUserSets((prev) => prev.filter((set) => set.set_id !== setId));
    }
  };

  const handleCreateSetButton = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double-submit
    if (isCreatingSet) {
      console.warn('[handleCreateSetButton] Already creating a set, ignoring duplicate submission');
      return;
    }

    // Validation
    if (name.trim() === "") {
      error("Please enter a name for your puzzle set.", "Name Required");
      return;
    }

    if (setSize <= 0 || repeatCount <= 0) {
      error("Please ensure set size and repeat count are valid.", "Invalid Values");
      return;
    }

    if (selectedThemes.length === 0) {
      error("Please select at least one theme.", "No Themes Selected");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      error("Please log in to create puzzle sets.", "Authentication Required");
      return;
    }

    console.log('[handleCreateSetButton] Starting set creation:', {
      name,
      elo: difficultySliderValue,
      size: setSize,
      repeats: repeatCount,
      themes: selectedThemes
    });

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
      console.log('[handleCreateSetButton] Set creation successful, redirecting...');
      setTimeout(() => {
        window.location.href = "/puzzles";
      }, 1500); // Give time to see success toast
    } else {
      console.error('[handleCreateSetButton] Set creation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10">Create Puzzle Set</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Create Form Section */}
        <div>
          <Card
            className={
              !isLoggedIn
                ? "blur-sm pointer-events-none opacity-50"
                : ""
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
              selectedThemes={selectedThemes}
              setSelectedThemes={setSelectedThemes}
              handleCreateSetButton={handleCreateSetButton}
              isCreatingSet={isCreatingSet}
            />
          </Card>

          {isCreatingSet && (
            <div className="mt-8">
              <PuzzleSetCreationProgress
                puzzleProgress={puzzleProgress}
                accuracyProgress={accuracyProgress}
              />
            </div>
          )}
        </div>

        {/* Existing Sets Section */}
        <div>
          <ExistingSets sets={userSets} isLoading={isSetsLoading} onDeleteSet={handleSetDelete} />
        </div>
      </div>
    </div>
  );
}