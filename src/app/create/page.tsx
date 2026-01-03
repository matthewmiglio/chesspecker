"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import CreateSetFormAltA from "@/components/create-page/create-set-form-alt-a";
import PuzzleSetCreationProgress from "@/components/create-page/set-creation-progress";
import ExistingSetsAltA from "@/components/create-page/ExistingSetsAltA";
import { useToast } from "@/lib/hooks/useToast";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import { PUZZLE_THEMES_OVER_10K } from "@/lib/constants/puzzleThemes";
import { usePremiumStatus, FREE_TIER_LIMITS } from "@/lib/hooks/usePremiumStatus";
import { Crown } from "lucide-react";
import Link from "next/link";

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
  const { isPremium } = usePremiumStatus();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Initialize with free tier defaults
  const [setSize, setSetSize] = useState<number>(100);
  const [repeatCount, setRepeatCount] = useState<number>(8);
  const [difficultySliderValue, setDifficultySliderValue] =
    useState<number>(1500);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([...FREE_TIER_LIMITS.freeThemes]);

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
  ): Promise<{ success: true; set_id: number } | { success: false; phase: string; error: string }> => {

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
        const errorMsg = "Failed to create puzzle set in database";
        error(errorMsg, "Creation Failed");
        setIsCreatingSet(false);
        return { success: false, phase: 'database_insert', error: errorMsg };
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
      return { success: true, set_id: setId };

    } catch (err) {
      setIsCreatingSet(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`Unexpected error in set creation: ${message}`, "Creation Failed");
      return { success: false, phase: 'puzzle_generation', error: message };
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

    const successResult = await deleteUserSet(setId);

    if (successResult) {
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

    // Check set limit for free users
    if (!isPremium && userSets.length >= FREE_TIER_LIMITS.maxSets) {
      error(`Free tier is limited to ${FREE_TIER_LIMITS.maxSets} puzzle sets. Upgrade to Premium for unlimited sets.`, "Set Limit Reached");
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
    if (result.success) {
      console.log('[handleCreateSetButton] Set creation successful, redirecting...', {
        setId: result.set_id,
        name,
        elo: difficultySliderValue,
        size: setSize,
        repeats: repeatCount
      });
      setTimeout(() => {
        window.location.href = "/puzzles";
      }, 1500); // Give time to see success toast
    } else {
      console.error('[handleCreateSetButton] Set creation failed', {
        phase: result.phase,
        error: result.error,
        params: {
          name,
          elo: difficultySliderValue,
          size: setSize,
          repeats: repeatCount,
          themes: selectedThemes.length > 0 ? selectedThemes : 'all themes'
        }
      });
    }
  };

  // Check if free user has reached set limit
  const hasReachedSetLimit = !isPremium && userSets.length >= FREE_TIER_LIMITS.maxSets;

  // Common props for form
  const formProps = {
    name,
    setName,
    description,
    setDescription,
    repeatCount,
    setRepeatCount,
    setSize,
    setSetSize,
    difficultySliderValue,
    setDifficultySliderValue,
    selectedThemes,
    setSelectedThemes,
    handleCreateSetButton,
    isCreatingSet,
    isPremium,
    onLockedThemeClick: () => info("Upgrade to Premium to unlock all 21 themes", "Premium Feature"),
  };

  // Common props for existing sets
  const existingSetsProps = {
    sets: userSets,
    isLoading: isSetsLoading,
    onDeleteSet: handleSetDelete,
    isLoggedIn,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10">Create Puzzle Set</h1>

      {/* Set limit warning for free users */}
      {hasReachedSetLimit && (
        <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="font-medium">You&apos;ve reached the free tier limit of {FREE_TIER_LIMITS.maxSets} puzzle sets</p>
              <p className="text-sm text-muted-foreground">
                Delete an existing set or upgrade to Premium for unlimited sets.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-500/80 transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Create Form Section */}
        <div className="relative">
          <div
            className={`bg-black/50 border border-red-500/20 p-2 ${
              !isLoggedIn || hasReachedSetLimit
                ? "blur-sm pointer-events-none opacity-50"
                : ""
            }`}
          >
            <CreateSetFormAltA {...formProps} />
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => signIn("google")}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500/90 transition-colors shadow-lg"
              >
                Log in to create a set
              </button>
            </div>
          )}

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
        <div className="bg-black/50 border border-red-500/20 p-2">
          <ExistingSetsAltA {...existingSetsProps} />
        </div>
      </div>
    </div>
  );
}
