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
      console.log(`\n🚀 ===== SET CREATION SESSION ${sessionId} STARTED =====`);
      console.log(`📊 Set Parameters:`);
      console.log(`   ├── Name: "${name}"`);
      console.log(`   ├── Size: ${size} puzzles`);
      console.log(`   ├── Repeats: ${repeats}`);
      console.log(`   ├── Target ELO: ${elo}`);
      console.log(`   ├── User: ${email}`);
      console.log(`   └── Timestamp: ${new Date().toISOString()}`);

      // Memory usage tracking
      if (performance.memory) {
        console.log(`💾 Initial Memory Usage:`);
        console.log(`   ├── Used: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
        console.log(`   ├── Total: ${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`);
        console.log(`   └── Limit: ${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`);
      }

      setIsCreatingSet(true);
      setPuzzleProgress(0);
      setAccuracyProgress(0);

      info("Creating puzzle set...", "Please wait", 6000);

      // Phase 1: Puzzle Generation
      console.log(`\n🧩 ===== PHASE 1: PUZZLE GENERATION =====`);
      console.time("⏱️ Puzzle Generation Time");

      const puzzleStartTime = performance.now();
      const puzzleIds = await createNewPuzzleList(size, elo, setPuzzleProgress);
      const puzzleEndTime = performance.now();

      console.timeEnd("⏱️ Puzzle Generation Time");
      console.log(`✅ Puzzle Generation Complete:`);
      console.log(`   ├── Generated: ${puzzleIds.length} unique puzzle IDs`);
      console.log(`   ├── Success Rate: ${((puzzleIds.length / size) * 100).toFixed(1)}%`);
      console.log(`   ├── Time Taken: ${(puzzleEndTime - puzzleStartTime).toFixed(2)}ms`);
      console.log(`   ├── Avg Time/Puzzle: ${((puzzleEndTime - puzzleStartTime) / puzzleIds.length).toFixed(2)}ms`);
      console.log(`   └── Sample IDs: ${puzzleIds.slice(0, 3).join(', ')}${puzzleIds.length > 3 ? '...' : ''}`);

      // Phase 2: Database Insertion
      console.log(`\n💾 ===== PHASE 2: DATABASE INSERTION =====`);
      console.time("⏱️ Database Insertion Time");

      const dbStartTime = performance.now();
      const requestPayload = { email, elo, size, repeats, name, puzzleIds };

      console.log(`📤 Sending request to /api/sets/addSet:`);
      console.log(`   ├── Payload size: ${JSON.stringify(requestPayload).length} characters`);
      console.log(`   ├── Puzzle IDs count: ${puzzleIds.length}`);
      console.log(`   └── Request timestamp: ${new Date().toISOString()}`);

      const res = await fetch("/api/sets/addSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const dbEndTime = performance.now();
      console.timeEnd("⏱️ Database Insertion Time");

      console.log(`📡 Database Response:`);
      console.log(`   ├── Status: ${res.status} ${res.statusText}`);
      console.log(`   ├── Response Time: ${(dbEndTime - dbStartTime).toFixed(2)}ms`);
      console.log(`   └── Headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error (${res.status})`;

        console.error(`\n❌ ===== DATABASE INSERTION FAILED =====`);
        console.error(`   ├── Status Code: ${res.status}`);
        console.error(`   ├── Error Message: ${errorMessage}`);
        console.error(`   ├── Response Data:`, errorData);
        console.error(`   └── Session ID: ${sessionId}`);

        error(`Failed to create puzzle set: ${errorMessage}`, "Creation Failed");
        setIsCreatingSet(false);
        return null;
      }

      const response = await res.json();
      const set = response.set;

      console.log(`✅ Database Insertion Successful:`);
      console.log(`   ├── Set ID: ${set.id}`);
      console.log(`   ├── Database Response:`, set);
      console.log(`   ├── Creation Time: ${(dbEndTime - dbStartTime).toFixed(2)}ms`);
      console.log(`   └── Total Puzzles Stored: ${set.puzzle_ids?.length || 'Unknown'}`);

      // Phase 3: Accuracy Tracking Setup
      console.log(`\n🎯 ===== PHASE 3: ACCURACY TRACKING SETUP =====`);
      console.time("⏱️ Accuracy Setup Time");

      info("Setting up accuracy tracking...", undefined, 4000);

      const accuracyStartTime = performance.now();
      let successfulAccuracyRows = 0;
      let failedAccuracyRows = 0;
      const accuracyErrors = [];

      console.log(`📝 Creating ${repeats} accuracy rows for set ID: ${set.id}`);

      // Create accuracy rows for each repeat index
      for (let i = 0; i < repeats; i++) {
        const rowStartTime = performance.now();
        console.log(`\n📋 Creating accuracy row ${i + 1}/${repeats}:`);
        console.log(`   ├── Set ID: ${set.id}`);
        console.log(`   ├── Repeat Index: ${i}`);
        console.log(`   └── Timestamp: ${new Date().toISOString()}`);

        try {
          const accuracyRes = await fetch("/api/accuracy/createSetAccuracy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ set_id: set.id, repeat_index: i }),
          });

          const rowEndTime = performance.now();
          const rowDuration = rowEndTime - rowStartTime;

          console.log(`   📡 API Response:`);
          console.log(`      ├── Status: ${accuracyRes.status} ${accuracyRes.statusText}`);
          console.log(`      ├── Time: ${rowDuration.toFixed(2)}ms`);
          console.log(`      └── Headers:`, Object.fromEntries(accuracyRes.headers.entries()));

          if (!accuracyRes.ok) {
            const errorData = await accuracyRes.json().catch(() => ({}));
            const errorDetail = errorData.error || 'Unknown error';

            console.error(`   ❌ Failed to create accuracy row:`);
            console.error(`      ├── Error: ${errorDetail}`);
            console.error(`      ├── Status: ${accuracyRes.status}`);
            console.error(`      ├── Response Data:`, errorData);
            console.error(`      └── Duration: ${rowDuration.toFixed(2)}ms`);

            accuracyErrors.push({ index: i, error: errorDetail, status: accuracyRes.status });
            failedAccuracyRows++;
            error(`Failed to create accuracy tracking for repeat ${i + 1}: ${errorDetail}`, "Accuracy Setup Failed");
          } else {
            const accuracyData = await accuracyRes.json();

            console.log(`   ✅ Accuracy row created successfully:`);
            console.log(`      ├── Message: ${accuracyData.message}`);
            console.log(`      ├── Data:`, accuracyData.data);
            console.log(`      ├── Duration: ${rowDuration.toFixed(2)}ms`);
            console.log(`      └── Progress: ${i + 1}/${repeats} (${((i + 1) / repeats * 100).toFixed(1)}%)`);

            successfulAccuracyRows++;
          }
        } catch (accuracyErr) {
          const rowEndTime = performance.now();
          const rowDuration = rowEndTime - rowStartTime;

          console.error(`   💥 Exception creating accuracy row:`);
          console.error(`      ├── Error:`, accuracyErr);
          console.error(`      ├── Type: ${accuracyErr instanceof Error ? accuracyErr.name : 'Unknown'}`);
          console.error(`      ├── Message: ${accuracyErr instanceof Error ? accuracyErr.message : 'Unknown'}`);
          console.error(`      ├── Stack:`, accuracyErr instanceof Error ? accuracyErr.stack : 'N/A');
          console.error(`      └── Duration: ${rowDuration.toFixed(2)}ms`);

          accuracyErrors.push({ index: i, error: accuracyErr.message, exception: true });
          failedAccuracyRows++;
          error(`Exception creating accuracy tracking for repeat ${i + 1}`, "Accuracy Setup Error");
        }

        // Update progress UI
        setAccuracyProgress(Math.floor(((i + 1) / repeats) * 100));
      }

      const accuracyEndTime = performance.now();
      const accuracyDuration = accuracyEndTime - accuracyStartTime;

      console.timeEnd("⏱️ Accuracy Setup Time");
      console.log(`\n📊 Accuracy Setup Summary:`);
      console.log(`   ├── Total Rows: ${repeats}`);
      console.log(`   ├── Successful: ${successfulAccuracyRows}`);
      console.log(`   ├── Failed: ${failedAccuracyRows}`);
      console.log(`   ├── Success Rate: ${((successfulAccuracyRows / repeats) * 100).toFixed(1)}%`);
      console.log(`   ├── Total Time: ${accuracyDuration.toFixed(2)}ms`);
      console.log(`   ├── Avg Time/Row: ${(accuracyDuration / repeats).toFixed(2)}ms`);
      console.log(`   └── Errors: ${accuracyErrors.length > 0 ? JSON.stringify(accuracyErrors, null, 2) : 'None'}`);

      // Final Summary
      const totalEndTime = performance.now();
      const totalDuration = totalEndTime - startTime;

      console.log(`\n🎉 ===== SET CREATION COMPLETED =====`);
      console.log(`📈 Performance Summary:`);
      console.log(`   ├── Total Duration: ${totalDuration.toFixed(2)}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log(`   ├── Puzzle Generation: ${((puzzleEndTime - puzzleStartTime) / totalDuration * 100).toFixed(1)}%`);
      console.log(`   ├── Database Insertion: ${((dbEndTime - dbStartTime) / totalDuration * 100).toFixed(1)}%`);
      console.log(`   ├── Accuracy Setup: ${(accuracyDuration / totalDuration * 100).toFixed(1)}%`);
      console.log(`   └── Session ID: ${sessionId}`);

      // Final memory usage
      if (performance.memory) {
        console.log(`💾 Final Memory Usage:`);
        console.log(`   ├── Used: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
        console.log(`   ├── Total: ${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`);
        console.log(`   └── Memory Delta: ${Math.round((performance.memory.usedJSHeapSize - (window as any).__initialMemory || 0) / 1024 / 1024)}MB`);
      }

      setIsCreatingSet(false);
      success(`"${name}" created successfully! (${totalDuration.toFixed(0)}ms)`, "Puzzle Set Ready");
      return set;

    } catch (err) {
      const errorEndTime = performance.now();
      const errorDuration = errorEndTime - startTime;

      console.error(`\n💥 ===== FATAL ERROR IN SET CREATION =====`);
      console.error(`🆔 Session ID: ${sessionId}`);
      console.error(`⏱️ Time to Error: ${errorDuration.toFixed(2)}ms`);
      console.error(`🎯 Error Type: ${err instanceof Error ? err.name : 'Unknown Error'}`);
      console.error(`📝 Error Message: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(`🔍 Stack Trace:`, err instanceof Error ? err.stack : 'N/A');
      console.error(`📊 Set Parameters:`, { name, size, repeats, elo, email });

      if (performance.memory) {
        console.error(`💾 Memory at Error:`);
        console.error(`   ├── Used: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
        console.error(`   └── Total: ${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`);
      }

      console.error(`\n🔧 Troubleshooting Suggestions:`);
      console.error(`   ├── Check network connectivity`);
      console.error(`   ├── Verify API endpoints are accessible`);
      console.error(`   ├── Try reducing set size if memory issues`);
      console.error(`   ├── Check browser developer console for more details`);
      console.error(`   └── Contact support with Session ID: ${sessionId}`);

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
      console.log(`🌐 API Call ${callId}: Fetching ${difficulty} puzzle (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const startTime = performance.now();
      const response = await fetch("/api/lichess/getPuzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const endTime = performance.now();

      console.log(`📡 API Response ${callId}: Status ${response.status} (${(endTime - startTime).toFixed(2)}ms)`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        console.error(`❌ API Error ${callId}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });

        // Retry logic for certain errors
        const retryableStatuses = [429, 500, 502, 503, 504];
        if (retryableStatuses.includes(response.status) && retryCount < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff, max 8s
          console.log(`🔄 Retrying ${callId} in ${backoffDelay}ms... (${retryCount + 1}/${maxRetries})`);

          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return await createNewPuzzle(difficulty, retryCount + 1);
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data || !data.puzzle || !data.puzzle.id) {
        console.error(`❌ Invalid puzzle data ${callId}:`, data);
        throw new Error(`Invalid puzzle data received: ${JSON.stringify(data)}`);
      }

      console.log(`✅ Puzzle fetched ${callId}: ${data.puzzle.id} (${data.puzzle.rating || 'Unknown'} rating)`);
      return data;

    } catch (err) {
      console.error(`💥 Exception in API call ${callId}:`, {
        error: err,
        difficulty,
        retryCount,
        timestamp: new Date().toISOString()
      });

      // Retry on network errors
      if (retryCount < maxRetries && (
        err instanceof TypeError && err.message.includes('fetch') ||
        err.name === 'NetworkError' ||
        err.message.includes('network')
      )) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`🔄 Network error retry ${callId} in ${backoffDelay}ms...`);

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

    console.log(`\n🎲 ===== PUZZLE GENERATION ${generationId} STARTED =====`);

    const difficultyEloMap: Record<string, number> = {
      easiest: 1,
      easier: 999,
      normal: 1499,
      harder: 2249,
      hardest: 3001,
    };

    const difficulties = Object.keys(difficultyEloMap);

    console.log(`⚙️ Generation Configuration:`);
    console.log(`   ├── Target Count: ${puzzle_count} puzzles`);
    console.log(`   ├── Target ELO: ${targetElo}`);
    console.log(`   ├── Max Set Size: ${maxSetSize}`);
    console.log(`   ├── Available Difficulties: ${difficulties.join(', ')}`);
    console.log(`   └── Difficulty Ranges:`);
    for (const [diff, elo] of Object.entries(difficultyEloMap)) {
      console.log(`       ├── ${diff}: ${elo}+ ELO`);
    }

    if (puzzle_count > maxSetSize) {
      console.log(`⚠️ Puzzle count capped: ${puzzle_count} → ${maxSetSize}`);
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

    console.log(`🎯 Difficulty Pool Analysis:`);
    console.log(`   ├── Easier Difficulties (< ${targetElo}): [${easierDifficulties.join(', ')}]`);
    console.log(`   ├── Harder Difficulties (≥ ${targetElo}): [${harderDifficulties.join(', ')}]`);
    console.log(`   └── Strategy: Dynamic balancing based on current average ELO`);

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

    console.log(`\n🔄 Starting puzzle collection loop...`);

    while (puzzleIds.size < puzzle_count) {
      const iterationStart = performance.now();
      const currentAvg = puzzleIds.size > 0 ? totalElo / puzzleIds.size : 0;

      const pool = currentAvg >= targetElo ? easierDifficulties : harderDifficulties;
      const poolChoice = currentAvg >= targetElo ? 'easier' : 'harder';

      if (pool.length === 0) {
        console.error(`❌ No available difficulties in ${poolChoice} pool! Breaking loop.`);
        break;
      }

      const selectedDifficulty = getRandom(pool);

      console.log(`\n🎯 Puzzle ${puzzleIds.size + 1}/${puzzle_count}:`);
      console.log(`   ├── Current Avg ELO: ${currentAvg.toFixed(1)} (Target: ${targetElo})`);
      console.log(`   ├── Pool Choice: ${poolChoice} (${pool.length} options)`);
      console.log(`   ├── Selected Difficulty: ${selectedDifficulty} (${difficultyEloMap[selectedDifficulty]}+ ELO)`);
      console.log(`   └── API Call #${apiCalls + 1}`);

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
          console.error(`   ❌ Invalid puzzle response: ${JSON.stringify(puzzle)}`);
          consecutiveFailures++;
          continue;
        }

        const puzzleId = puzzle.puzzle.id;

        console.log(`   📡 API Response (${callDuration.toFixed(2)}ms):`);
        console.log(`      ├── Puzzle ID: ${puzzleId}`);
        console.log(`      ├── Response Size: ${JSON.stringify(puzzle).length} chars`);
        console.log(`      ├── Rating: ${puzzle.puzzle.rating || 'Unknown'}`);
        console.log(`      └── Themes: ${puzzle.puzzle.themes?.join(', ') || 'Unknown'}`);

        if (puzzleIds.has(puzzleId)) {
          duplicates++;
          console.log(`   ⚠️ Duplicate puzzle detected: ${puzzleId} (Total duplicates: ${duplicates})`);
          consecutiveFailures++;

          if (consecutiveFailures >= maxConsecutiveFailures) {
            console.error(`   💥 Too many consecutive failures (${consecutiveFailures}). Breaking loop.`);
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

        console.log(`   ✅ Puzzle added successfully:`);
        console.log(`      ├── Collection Size: ${puzzleIds.size}/${puzzle_count}`);
        console.log(`      ├── New Avg ELO: ${newAvg.toFixed(1)} (Δ${(newAvg - currentAvg).toFixed(1)})`);
        console.log(`      ├── Progress: ${progress}%`);
        console.log(`      ├── Iteration Time: ${iterationDuration.toFixed(2)}ms`);
        console.log(`      └── ETA: ${((iterationDuration * (puzzle_count - puzzleIds.size)) / 1000).toFixed(1)}s`);

        onProgress(progress);

        // Log progress milestones
        if (puzzleIds.size % 25 === 0 || progress % 20 === 0) {
          console.log(`\n📊 Progress Milestone (${progress}%):`);
          console.log(`   ├── Puzzles Collected: ${puzzleIds.size}/${puzzle_count}`);
          console.log(`   ├── API Calls Made: ${apiCalls}`);
          console.log(`   ├── Duplicates Found: ${duplicates}`);
          console.log(`   ├── Success Rate: ${((puzzleIds.size / apiCalls) * 100).toFixed(1)}%`);
          console.log(`   ├── Avg API Time: ${(apiCallTimes.reduce((a, b) => a + b, 0) / apiCallTimes.length).toFixed(2)}ms`);
          console.log(`   └── Current ELO Distribution:`);
          for (const [diff, count] of Object.entries(difficultyCounts)) {
            const percentage = ((count / puzzleIds.size) * 100).toFixed(1);
            console.log(`       ├── ${diff}: ${count} (${percentage}%)`);
          }
        }

      } catch (puzzleErr) {
        console.error(`   💥 API call failed:`);
        console.error(`      ├── Error:`, puzzleErr);
        console.error(`      ├── Difficulty: ${selectedDifficulty}`);
        console.error(`      ├── Consecutive Failures: ${consecutiveFailures + 1}`);
        console.error(`      └── API Call #${apiCalls}`);

        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.error(`   🚨 Maximum consecutive failures reached. Breaking loop.`);
          break;
        }
      }
    }

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    // Final Statistics
    console.log(`\n📈 ===== PUZZLE GENERATION COMPLETE =====`);
    console.log(`🎲 Generation ID: ${generationId}`);
    console.log(`⏱️ Total Duration: ${totalDuration.toFixed(2)}ms (${(totalDuration / 1000).toFixed(2)}s)`);

    console.log(`\n📊 Collection Statistics:`);
    console.log(`   ├── Requested: ${puzzle_count} puzzles`);
    console.log(`   ├── Collected: ${puzzleIds.size} puzzles`);
    console.log(`   ├── Success Rate: ${((puzzleIds.size / puzzle_count) * 100).toFixed(1)}%`);
    console.log(`   ├── Final Avg ELO: ${(totalElo / puzzleIds.size).toFixed(1)} (Target: ${targetElo})`);
    console.log(`   ├── ELO Deviation: ${Math.abs((totalElo / puzzleIds.size) - targetElo).toFixed(1)}`);
    console.log(`   └── Collection Efficiency: ${((puzzleIds.size / Math.max(apiCalls, 1)) * 100).toFixed(1)}%`);

    console.log(`\n🌐 API Performance:`);
    console.log(`   ├── Total API Calls: ${apiCalls}`);
    console.log(`   ├── Successful Calls: ${puzzleIds.size}`);
    console.log(`   ├── Failed/Duplicate Calls: ${apiCalls - puzzleIds.size}`);
    console.log(`   ├── Duplicates Found: ${duplicates}`);
    console.log(`   ├── Avg Response Time: ${apiCallTimes.length > 0 ? (apiCallTimes.reduce((a, b) => a + b, 0) / apiCallTimes.length).toFixed(2) : 0}ms`);
    console.log(`   ├── Fastest Call: ${fastestCall === Infinity ? 'N/A' : fastestCall.toFixed(2)}ms`);
    console.log(`   ├── Slowest Call: ${slowestCall.toFixed(2)}ms`);
    console.log(`   └── Calls per Second: ${((apiCalls / totalDuration) * 1000).toFixed(2)}`);

    console.log(`\n🎯 Difficulty Distribution:`);
    for (const [diff, count] of Object.entries(difficultyCounts)) {
      const percentage = ((count / puzzleIds.size) * 100).toFixed(1);
      const eloRange = difficultyEloMap[diff];
      console.log(`   ├── ${diff.padEnd(8)} │ ${String(count).padStart(3)} puzzles (${String(percentage).padStart(5)}%) │ ${eloRange}+ ELO`);
    }

    console.log(`\n🔀 Shuffling puzzle order...`);
    const shuffleStart = performance.now();
    const allPuzzleIds = Array.from(puzzleIds);
    const shuffledPuzzleIds = shuffleStringList(allPuzzleIds);
    const shuffleEnd = performance.now();

    console.log(`✅ Shuffling complete: ${(shuffleEnd - shuffleStart).toFixed(2)}ms`);
    console.log(`📝 Sample shuffled IDs: [${shuffledPuzzleIds.slice(0, 5).join(', ')}...]`);

    console.log(`\n🏁 Generation Summary:`);
    console.log(`   ├── Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   ├── Puzzles Generated: ${shuffledPuzzleIds.length}`);
    console.log(`   ├── Generation Rate: ${(shuffledPuzzleIds.length / (totalDuration / 1000)).toFixed(2)} puzzles/sec`);
    console.log(`   ├── Memory Impact: ${performance.memory ? Math.round((performance.memory.usedJSHeapSize - (window as any).__initialMemory || 0) / 1024) + 'KB' : 'Unknown'}`);
    console.log(`   └── Generation ID: ${generationId}`);

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
        // window.location.href = "/puzzles";
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
