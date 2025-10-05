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

    console.log(`🚀 SET CREATION STARTED - Session: ${sessionId}`);
    console.log(`📊 Parameters:`, {
      email: email,
      targetElo: elo,
      setSize: size,
      repeatCount: repeats,
      setName: name,
      sessionId: sessionId
    });

    try {
      console.log(`⚙️ Initializing set creation state...`);
      setIsCreatingSet(true);
      setPuzzleProgress(0);
      setAccuracyProgress(0);
      console.log(`✅ Set creation state initialized successfully`);

      info("Creating puzzle set...", "Please wait", 6000);
      console.log(`🔔 Toast notification sent: Creating puzzle set...`);

      // Phase 1: Puzzle Generation
      console.log(`\n🧩 === PHASE 1: PUZZLE GENERATION ===`);
      console.log(`🎯 Generating ${size} puzzles for ELO ${elo}...`);
      const puzzleGenStartTime = performance.now();
      const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);
      const puzzleGenEndTime = performance.now();
      const puzzleGenDuration = puzzleGenEndTime - puzzleGenStartTime;

      if (puzzleIds && puzzleIds.length > 0) {
        console.log(`✅ Puzzle generation SUCCESSFUL! Generated ${puzzleIds.length}/${size} puzzles in ${puzzleGenDuration.toFixed(2)}ms`);
        console.log(`🎮 First 5 puzzle IDs:`, puzzleIds.slice(0, 5));
      } else {
        console.log(`❌ Puzzle generation FAILED! No puzzles generated`);
        throw new Error('No puzzles were generated');
      }

      // Phase 2: Database Insertion
      console.log(`\n💾 === PHASE 2: DATABASE INSERTION ===`);
      const requestPayload = { email, elo, size, repeats, name, puzzleIds };
      console.log(`📦 Preparing database payload:`, {
        email: email,
        elo: elo,
        size: size,
        repeats: repeats,
        name: name,
        puzzleCount: puzzleIds.length
      });

      console.log(`🔄 Making API call to /api/sets/addSet...`);
      const dbInsertStartTime = performance.now();
      const res = await fetch("/api/sets/addSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const dbInsertEndTime = performance.now();
      const dbInsertDuration = dbInsertEndTime - dbInsertStartTime;

      console.log(`📡 Database API response received in ${dbInsertDuration.toFixed(2)}ms`);
      console.log(`📊 Response status: ${res.status} ${res.statusText}`);


      if (!res.ok) {
        console.log(`❌ DATABASE INSERTION FAILED!`);
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error (${res.status})`;
        console.log(`💥 Error details:`, {
          status: res.status,
          statusText: res.statusText,
          errorMessage: errorMessage,
          errorData: errorData
        });

        error(`Failed to create puzzle set: ${errorMessage}`, "Creation Failed");
        setIsCreatingSet(false);
        return null;
      }

      const response = await res.json();
      const set = response.set;
      console.log(`✅ DATABASE INSERTION SUCCESSFUL!`);
      console.log(`🎯 Created set details:`, {
        set_id: set.set_id,
        name: set.name,
        size: set.size,
        elo: set.elo,
        repeats: set.repeats
      });

      // Phase 3: Accuracy Tracking Setup
      console.log(`\n📈 === PHASE 3: ACCURACY TRACKING SETUP ===`);
      info("Setting up accuracy tracking...", undefined, 4000);
      console.log(`🔔 Toast notification sent: Setting up accuracy tracking...`);
      console.log(`🎯 Creating ${repeats} accuracy tracking rows for set ${set.set_id}...`);

      const accuracyErrors = [];
      let successfulAccuracyRows = 0;
      let failedAccuracyRows = 0;
      const accuracySetupStartTime = performance.now();

      // Create accuracy rows for each repeat index
      for (let i = 0; i < repeats; i++) {
        console.log(`\n🔄 Creating accuracy row ${i + 1}/${repeats} (repeat_index: ${i})...`);
        const accuracyRowStartTime = performance.now();

        try {
          const accuracyPayload = { set_id: set.set_id, repeat_index: i };
          console.log(`📦 Accuracy payload:`, accuracyPayload);

          const accuracyRes = await fetch("/api/accuracy/createSetAccuracy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accuracyPayload),
          });

          const accuracyRowEndTime = performance.now();
          const accuracyRowDuration = accuracyRowEndTime - accuracyRowStartTime;
          console.log(`📡 Accuracy API response for row ${i + 1} received in ${accuracyRowDuration.toFixed(2)}ms`);

          if (!accuracyRes.ok) {
            console.log(`❌ Accuracy row ${i + 1} FAILED!`);
            const errorData = await accuracyRes.json().catch(() => ({}));
            const errorDetail = errorData.error || 'Unknown error';
            console.log(`💥 Accuracy error details:`, {
              repeatIndex: i,
              status: accuracyRes.status,
              statusText: accuracyRes.statusText,
              errorDetail: errorDetail,
              errorData: errorData
            });

            accuracyErrors.push({ index: i, error: errorDetail, status: accuracyRes.status });
            failedAccuracyRows++;
            error(`Failed to create accuracy tracking for repeat ${i + 1}: ${errorDetail}`, "Accuracy Setup Failed");
          } else {
            const accuracyResult = await accuracyRes.json();
            console.log(`✅ Accuracy row ${i + 1} SUCCESS!`);
            console.log(`📊 Accuracy result:`, accuracyResult);
            successfulAccuracyRows++;
          }
        } catch (accuracyErr) {
          console.log(`💥 EXCEPTION in accuracy row ${i + 1}:`, accuracyErr);
          const errorMessage =
            typeof accuracyErr === "object" && accuracyErr !== null && "message" in accuracyErr
              ? String((accuracyErr as { message?: unknown }).message)
              : String(accuracyErr);
          accuracyErrors.push({ index: i, error: errorMessage, exception: true });
          failedAccuracyRows++;
          error(`Exception creating accuracy tracking for repeat ${i + 1}`, "Accuracy Setup Error");
        }

        // Update progress UI
        const accuracyProgressPercent = Math.floor(((i + 1) / repeats) * 100);
        console.log(`📊 Accuracy progress: ${accuracyProgressPercent}% (${i + 1}/${repeats} rows completed)`);
        setAccuracyProgress(accuracyProgressPercent);
      }

      const accuracySetupEndTime = performance.now();
      const accuracySetupDuration = accuracySetupEndTime - accuracySetupStartTime;
      console.log(`\n📈 === ACCURACY TRACKING SETUP COMPLETE ===`);
      console.log(`✅ Successful rows: ${successfulAccuracyRows}/${repeats}`);
      console.log(`❌ Failed rows: ${failedAccuracyRows}/${repeats}`);
      console.log(`⏱️ Total accuracy setup time: ${accuracySetupDuration.toFixed(2)}ms`);
      if (accuracyErrors.length > 0) {
        console.log(`🚨 Accuracy errors encountered:`, accuracyErrors);
      }


      // Final Summary
      const totalEndTime = performance.now();
      const totalDuration = totalEndTime - startTime;

      console.log(`\n🎉 === SET CREATION COMPLETE ===`);
      console.log(`✅ SUCCESS! Set "${name}" created successfully!`);
      console.log(`📊 Final Summary:`, {
        sessionId: sessionId,
        setName: name,
        setId: set.set_id,
        puzzlesGenerated: puzzleIds.length,
        targetSize: size,
        accuracyRowsCreated: successfulAccuracyRows,
        accuracyRowsFailed: failedAccuracyRows,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        puzzleGenDuration: `${puzzleGenDuration.toFixed(2)}ms`,
        dbInsertDuration: `${dbInsertDuration.toFixed(2)}ms`,
        accuracySetupDuration: `${accuracySetupDuration.toFixed(2)}ms`
      });

      setIsCreatingSet(false);
      success(`"${name}" created successfully! (${totalDuration.toFixed(0)}ms)`, "Puzzle Set Ready");
      console.log(`🔔 Success toast notification sent`);
      return set;

    } catch (err) {
      const totalEndTime = performance.now();
      const totalDuration = totalEndTime - startTime;

      console.log(`\n💥 === SET CREATION FAILED ===`);
      console.log(`❌ CRITICAL ERROR after ${totalDuration.toFixed(2)}ms`);
      console.log(`🆔 Session: ${sessionId}`);
      console.log(`🚨 Error details:`, {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        name: err instanceof Error ? err.name : 'Unknown error type'
      });

      setIsCreatingSet(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      error(`Unexpected error in set creation: ${message} (Session: ${sessionId})`, "Creation Failed");
      console.log(`🔔 Error toast notification sent`);
      return null;
    }
  };

  const createNewPuzzle = async (difficulty: string, retryCount = 0) => {
    const maxRetries = 3;
    const puzzleRequestId = Math.random().toString(36).substr(2, 6);

    console.log(`🎲 [${puzzleRequestId}] Requesting puzzle - Difficulty: ${difficulty}, Retry: ${retryCount}/${maxRetries}`);

    const difficultyEloMap: Record<string, number> = {
      easiest: 1,
      easier: 999,
      normal: 1499,
      harder: 2249,
      hardest: 3001,
    };

    const rating = difficultyEloMap[difficulty];

    try {
      const apiCallStartTime = performance.now();
      console.log(`📦 [${puzzleRequestId}] Requesting puzzle with rating < ${rating}`);

      const response = await fetch(`/api/puzzles/random-under?rating=${rating}`);

      const apiCallEndTime = performance.now();
      const apiCallDuration = apiCallEndTime - apiCallStartTime;
      console.log(`📡 [${puzzleRequestId}] Supabase API response received in ${apiCallDuration.toFixed(2)}ms`);
      console.log(`📊 [${puzzleRequestId}] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.log(`❌ [${puzzleRequestId}] Supabase API request FAILED!`);
        const errorText = await response.text().catch(() => 'No response body');
        console.log(`💥 [${puzzleRequestId}] Error details:`, {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          retryCount: retryCount
        });

        // Retry logic for certain errors
        const retryableStatuses = [429, 500, 502, 503, 504];
        if (retryableStatuses.includes(response.status) && retryCount < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff, max 8s
          console.log(`🔄 [${puzzleRequestId}] Retrying in ${backoffDelay}ms... (${retryCount + 1}/${maxRetries})`);

          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return await createNewPuzzle(difficulty, retryCount + 1);
        }

        console.log(`🚨 [${puzzleRequestId}] Max retries exceeded or non-retryable error!`);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📝 [${puzzleRequestId}] Parsing response data...`);

      if (!data || !data.puzzle || !data.puzzle.PuzzleId) {
        console.log(`❌ [${puzzleRequestId}] Invalid puzzle data received:`, data);
        throw new Error(`Invalid puzzle data received: ${JSON.stringify(data)}`);
      }

      console.log(`✅ [${puzzleRequestId}] Puzzle received successfully!`);
      console.log(`🎯 [${puzzleRequestId}] Puzzle details:`, {
        id: data.puzzle.PuzzleId,
        rating: data.puzzle.Rating,
        themes: data.puzzle.Themes,
        url: data.puzzle.GameUrl
      });

      // Transform Supabase puzzle format to match expected format
      return {
        puzzle: {
          id: data.puzzle.PuzzleId,
          rating: data.puzzle.Rating,
          themes: data.puzzle.Themes,
          url: data.puzzle.GameUrl
        }
      };

    } catch (err) {
      console.log(`💥 [${puzzleRequestId}] EXCEPTION caught in createNewPuzzle:`, err);
      console.log(`🔍 [${puzzleRequestId}] Error analysis:`, {
        type: err instanceof Error ? err.constructor.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        isNetworkError: err instanceof TypeError && err.message.includes('fetch'),
        isNetworkErrorByName: err instanceof Error && err.name === 'NetworkError',
        isNetworkErrorByMessage: err instanceof Error && err.message && err.message.includes('network')
      });

      // Retry on network errors
      if (retryCount < maxRetries && (
        err instanceof TypeError && err.message.includes('fetch') ||
        (err instanceof Error && err.name === 'NetworkError') ||
        (err instanceof Error && err.message.includes('network'))
      )) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`🔄 [${puzzleRequestId}] Network error detected, retrying in ${backoffDelay}ms... (${retryCount + 1}/${maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return await createNewPuzzle(difficulty, retryCount + 1);
      }

      console.log(`🚨 [${puzzleRequestId}] Cannot retry - throwing error`);
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
    const puzzleListSessionId = Math.random().toString(36).substr(2, 8);
    const startTime = performance.now();

    console.log(`\n🎲 === PUZZLE LIST GENERATION START ===`);
    console.log(`🆔 Session: ${puzzleListSessionId}`);
    console.log(`🎯 Target: ${puzzle_count} puzzles at ELO ${targetElo}`);

    const difficultyEloMap: Record<string, number> = {
      easiest: 1,
      easier: 999,
      normal: 1499,
      harder: 2249,
      hardest: 3001,
    };
    console.log(`📊 Difficulty mapping:`, difficultyEloMap);

    const difficulties = Object.keys(difficultyEloMap);
    console.log(`📋 Available difficulties:`, difficulties);

    if (puzzle_count > maxSetSize) {
      console.log(`⚠️ Requested ${puzzle_count} puzzles exceeds max ${maxSetSize}, capping at ${maxSetSize}`);
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

    console.log(`📊 Difficulty pools:`, {
      easier: easierDifficulties,
      harder: harderDifficulties,
      targetElo: targetElo
    });

    const puzzleIds: Set<string> = new Set();
    const difficultyCounts: Record<string, number> = {};
    let totalElo = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 10;
    let iterationCount = 0;
    let duplicateAttempts = 0;
    let apiCallCount = 0;
    let successfulApiCalls = 0;

    console.log(`🔄 Starting puzzle collection loop...`);

    while (puzzleIds.size < puzzle_count) {
      iterationCount++;
      const currentAvg = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

      if (iterationCount % 10 === 0) {
        console.log(`🔄 Loop iteration ${iterationCount} - Progress: ${puzzleIds.size}/${puzzle_count} puzzles (${(puzzleIds.size/puzzle_count*100).toFixed(1)}%)`);
        console.log(`📊 Current stats:`, {
          currentAverage: currentAvg.toFixed(0),
          targetElo: targetElo,
          consecutiveFailures: consecutiveFailures,
          apiCalls: apiCallCount,
          successfulApiCalls: successfulApiCalls,
          duplicates: duplicateAttempts
        });
      }

      const pool = currentAvg >= targetElo ? easierDifficulties : harderDifficulties;
      const poolType = currentAvg >= targetElo ? 'easier' : 'harder';
      console.log(`🎯 Selecting from ${poolType} pool (current avg: ${currentAvg.toFixed(0)}, target: ${targetElo})`);

      if (pool.length === 0) {
        console.log(`❌ No available difficulties in ${poolType} pool - breaking loop`);
        break;
      }

      const selectedDifficulty = getRandom(pool);
      console.log(`🎲 Selected difficulty: ${selectedDifficulty} (ELO ${difficultyEloMap[selectedDifficulty]})`);

      try {
        apiCallCount++;
        const puzzle = await createNewPuzzle(selectedDifficulty);

        if (!puzzle?.puzzle?.id) {
          console.log(`❌ No puzzle ID received from API`);
          consecutiveFailures++;
          continue;
        }

        const puzzleId = puzzle.puzzle.id;
        successfulApiCalls++;

        if (puzzleIds.has(puzzleId)) {
          console.log(`🔄 Duplicate puzzle ID detected: ${puzzleId}`);
          duplicateAttempts++;
          consecutiveFailures++;

          if (consecutiveFailures >= maxConsecutiveFailures) {
            console.log(`🚨 Max consecutive failures (${maxConsecutiveFailures}) reached - breaking loop`);
            break;
          }
          continue;
        }

        // Success! Add to collection
        puzzleIds.add(puzzleId);
        totalElo += difficultyEloMap[selectedDifficulty];
        difficultyCounts[selectedDifficulty] = (difficultyCounts[selectedDifficulty] || 0) + 1;
        consecutiveFailures = 0;

        const progress = Math.floor((puzzleIds.size / puzzle_count) * 100);
        const newAverage = totalElo / puzzleIds.size;

        console.log(`✅ Puzzle ${puzzleIds.size}/${puzzle_count} added! ID: ${puzzleId}`);
        console.log(`📊 New average ELO: ${newAverage.toFixed(0)} (target: ${targetElo})`);
        console.log(`📈 Progress: ${progress}%`);

        onProgress(progress);

      } catch (error) {
        console.log(`💥 Exception in puzzle generation loop:`, error);
        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`🚨 Max consecutive failures (${maxConsecutiveFailures}) reached due to exception - breaking loop`);
          break;
        }
      }
    }

    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    const finalAverage = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

    console.log(`\n🎲 === PUZZLE LIST GENERATION COMPLETE ===`);
    console.log(`🆔 Session: ${puzzleListSessionId}`);
    console.log(`📊 Final Statistics:`, {
      requested: puzzle_count,
      generated: puzzleIds.size,
      successRate: `${(puzzleIds.size/puzzle_count*100).toFixed(1)}%`,
      finalAverageElo: finalAverage.toFixed(0),
      targetElo: targetElo,
      totalIterations: iterationCount,
      totalApiCalls: apiCallCount,
      successfulApiCalls: successfulApiCalls,
      duplicateAttempts: duplicateAttempts,
      finalConsecutiveFailures: consecutiveFailures,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
      avgTimePerPuzzle: `${(totalDuration/puzzleIds.size).toFixed(2)}ms`
    });
    console.log(`🎨 Difficulty distribution:`, difficultyCounts);


    const allPuzzleIds = Array.from(puzzleIds);
    console.log(`🎲 Converting Set to Array: ${allPuzzleIds.length} puzzles`);
    console.log(`🔀 Shuffling puzzle order...`);
    const shuffledPuzzleIds = shuffleStringList(allPuzzleIds);
    console.log(`✅ Shuffling complete - first 5 IDs:`, shuffledPuzzleIds.slice(0, 5));
    console.log(`🎉 Puzzle list generation SUCCESS! Returning ${shuffledPuzzleIds.length} puzzles`);

    return shuffledPuzzleIds;
  };

  const handleCreateSetButton = async (e: React.FormEvent) => {
    e.preventDefault();
    const buttonClickTime = performance.now();
    const requestId = Math.random().toString(36).substr(2, 10);

    console.log(`\n🚀 === SET CREATION REQUEST INITIATED ===`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`📝 Form data submitted:`, {
      name: name.trim(),
      description: description.trim(),
      setSize: setSize,
      repeatCount: repeatCount,
      difficultySliderValue: difficultySliderValue,
      userEmail: session?.user?.email
    });

    // Validation
    console.log(`🔍 Starting form validation...`);

    if (name.trim() === "") {
      console.log(`❌ Validation FAILED: Empty name`);
      error("Please enter a name for your puzzle set.", "Name Required");
      return;
    }
    console.log(`✅ Name validation passed: "${name.trim()}"`);

    if (setSize <= 0 || repeatCount <= 0) {
      console.log(`❌ Validation FAILED: Invalid values - setSize: ${setSize}, repeatCount: ${repeatCount}`);
      error("Please ensure set size and repeat count are valid.", "Invalid Values");
      return;
    }
    console.log(`✅ Size/repeat validation passed: ${setSize} puzzles, ${repeatCount} repeats`);

    const email = session?.user?.email;
    if (!email) {
      console.log(`❌ Validation FAILED: No user email found`);
      console.log(`🔐 Session data:`, session);
      error("Please log in to create puzzle sets.", "Authentication Required");
      return;
    }
    console.log(`✅ Authentication validation passed: ${email}`);
    console.log(`✅ All validations PASSED - proceeding with set creation`);

    // Track usage statistics
    console.log(`\n📈 === TRACKING USAGE STATISTICS ===`);
    console.log(`📊 Incrementing daily set creation count...`);
    incrementSetCreate();
    console.log(`📊 Incrementing daily puzzle request count by ${setSize}...`);
    incrementPuzzleRequest(setSize);
    console.log(`📊 Incrementing user set creation count for ${email}...`);
    incrementUserSetCreate(email);
    console.log(`📊 Incrementing user puzzle requests by ${setSize} for ${email}...`);
    incrementUserPuzzleRequests(email, setSize);
    console.log(`✅ Usage statistics tracking complete`);

    // Create the set
    console.log(`\n🎯 === INITIATING SET CREATION ===`);
    console.log(`🔄 Calling addNewSetToDatabase with parameters:`, {
      email: email,
      elo: difficultySliderValue,
      size: setSize,
      repeats: repeatCount,
      name: name
    });

    const setCreationStartTime = performance.now();
    const result = await addNewSetToDatabase(
      email,
      difficultySliderValue,
      setSize,
      repeatCount,
      name
    );
    const setCreationEndTime = performance.now();
    const totalRequestDuration = setCreationEndTime - buttonClickTime;
    const setCreationDuration = setCreationEndTime - setCreationStartTime;

    console.log(`\n🎉 === SET CREATION REQUEST COMPLETE ===`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`⏱️ Total request time: ${totalRequestDuration.toFixed(2)}ms`);
    console.log(`⏱️ Set creation time: ${setCreationDuration.toFixed(2)}ms`);
    console.log(`📋 Result:`, result ? 'SUCCESS' : 'FAILED');

    // Only redirect if creation was successful
    if (result) {
      console.log(`✅ Set creation SUCCESSFUL - scheduling redirect to /puzzles in 1500ms`);
      console.log(`🎆 Created set details:`, result);
      setTimeout(() => {
        console.log(`🔄 Redirecting to /puzzles...`);
        window.location.href = "/puzzles";
      }, 1500); // Give time to see success toast
    } else {
      console.log(`❌ Set creation FAILED - no redirect will occur`);
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