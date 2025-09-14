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


  const addNewSetToDatabase = async (
    email: string,
    elo: number,
    size: number,
    repeats: number,
    name: string
  ) => {
    const startTime = performance.now();
    const sessionId = Math.random().toString(36).substr(2, 9);

    try {
      setIsCreatingSet(true);
      setPuzzleProgress(0);
      setAccuracyProgress(0);

      info("Creating puzzle set...", "Please wait", 6000);

      // Phase 1: Puzzle Generation
      const puzzleStartTime = performance.now();
      const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);
      const puzzleEndTime = performance.now();

      // Phase 2: Database Insertion
      const dbStartTime = performance.now();
      const requestPayload = { email, elo, size, repeats, name, puzzleIds };

      const res = await fetch("/api/sets/addSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const dbEndTime = performance.now();

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error (${res.status})`;

        error(`Failed to create puzzle set: ${errorMessage}`, "Creation Failed");
        setIsCreatingSet(false);
        return null;
      }

      const response = await res.json();
      const set = response.set;

      // Phase 3: Accuracy Tracking Setup
      info("Setting up accuracy tracking...", undefined, 4000);

      const accuracyStartTime = performance.now();
      let successfulAccuracyRows = 0;
      let failedAccuracyRows = 0;
      const accuracyErrors = [];

      // Create accuracy rows for each repeat index
      for (let i = 0; i < repeats; i++) {
        const rowStartTime = performance.now();

        try {
          const accuracyRes = await fetch("/api/accuracy/createSetAccuracy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ set_id: set.set_id, repeat_index: i }),
          });

          const rowEndTime = performance.now();
          const rowDuration = rowEndTime - rowStartTime;

          if (!accuracyRes.ok) {
            const errorData = await accuracyRes.json().catch(() => ({}));
            const errorDetail = errorData.error || 'Unknown error';

            accuracyErrors.push({ index: i, error: errorDetail, status: accuracyRes.status });
            failedAccuracyRows++;
            error(`Failed to create accuracy tracking for repeat ${i + 1}: ${errorDetail}`, "Accuracy Setup Failed");
          } else {
            const accuracyData = await accuracyRes.json();
            successfulAccuracyRows++;
          }
        } catch (accuracyErr) {
          const rowEndTime = performance.now();
          const rowDuration = rowEndTime - rowStartTime;

          accuracyErrors.push({ index: i, error: accuracyErr.message, exception: true });
          failedAccuracyRows++;
          error(`Exception creating accuracy tracking for repeat ${i + 1}`, "Accuracy Setup Error");
        }

        // Update progress UI
        setAccuracyProgress(Math.floor(((i + 1) / repeats) * 100));
      }

      const accuracyEndTime = performance.now();
      const accuracyDuration = accuracyEndTime - accuracyStartTime;

      // Final Summary
      const totalEndTime = performance.now();
      const totalDuration = totalEndTime - startTime;

      setIsCreatingSet(false);
      success(`"${name}" created successfully! (${totalDuration.toFixed(0)}ms)`, "Puzzle Set Ready");
      return set;

    } catch (err) {
      const errorEndTime = performance.now();
      const errorDuration = errorEndTime - startTime;

      setIsCreatingSet(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`Unexpected error in set creation: ${message} (Session: ${sessionId})`, "Creation Failed");
      return null;
    }
  };

  const createNewPuzzle = async (difficulty: string, retryCount = 0) => {
    const maxRetries = 3;
    const callId = Math.random().toString(36).substr(2, 4);

    try {
      const startTime = performance.now();
      const response = await fetch("/api/lichess/getPuzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const endTime = performance.now();

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');

        // Retry logic for certain errors
        const retryableStatuses = [429, 500, 502, 503, 504];
        if (retryableStatuses.includes(response.status) && retryCount < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff, max 8s

          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return await createNewPuzzle(difficulty, retryCount + 1);
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data || !data.puzzle || !data.puzzle.id) {
        throw new Error(`Invalid puzzle data received: ${JSON.stringify(data)}`);
      }

      return data;

    } catch (err) {
      // Retry on network errors
      if (retryCount < maxRetries && (
        err instanceof TypeError && err.message.includes('fetch') ||
        err.name === 'NetworkError' ||
        err.message.includes('network')
      )) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);

        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return await createNewPuzzle(difficulty, retryCount + 1);
      }

      throw err;
    }
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
    const generationId = Math.random().toString(36).substr(2, 6);
    const startTime = performance.now();

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
    let apiCalls = 0;
    let duplicates = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 10;

    // API call tracking
    const apiCallTimes: number[] = [];
    let fastestCall = Infinity;
    let slowestCall = 0;

    while (puzzleIds.size < puzzle_count) {
      const iterationStart = performance.now();
      const currentAvg = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

      const pool = currentAvg >= targetElo ? easierDifficulties : harderDifficulties;
      const poolChoice = currentAvg >= targetElo ? 'easier' : 'harder';

      if (pool.length === 0) {
        break;
      }

      const selectedDifficulty = getRandom(pool);

      try {
        const callStart = performance.now();
        apiCalls++;

        const puzzle = await createNewPuzzle(selectedDifficulty);

        const callEnd = performance.now();
        const callDuration = callEnd - callStart;
        apiCallTimes.push(callDuration);

        if (callDuration < fastestCall) fastestCall = callDuration;
        if (callDuration > slowestCall) slowestCall = callDuration;

        if (!puzzle?.puzzle?.id) {
          consecutiveFailures++;
          continue;
        }

        const puzzleId = puzzle.puzzle.id;

        if (puzzleIds.has(puzzleId)) {
          duplicates++;
          consecutiveFailures++;

          if (consecutiveFailures >= maxConsecutiveFailures) {
            break;
          }
          continue;
        }

        // Success! Add to collection
        puzzleIds.add(puzzleId);
        totalElo += difficultyEloMap[selectedDifficulty];
        difficultyCounts[selectedDifficulty] = (difficultyCounts[selectedDifficulty] || 0) + 1;
        consecutiveFailures = 0;

        const iterationEnd = performance.now();
        const iterationDuration = iterationEnd - iterationStart;
        const newAvg = totalElo / puzzleIds.size;
        const progress = Math.floor((puzzleIds.size / puzzle_count) * 100);

        onProgress(progress);

      } catch (puzzleErr) {
        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          break;
        }
      }
    }

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

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