"use client";

import type React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import CreateSetForm from "@/components/create-page/create-set-form";
import PuzzleSetCreationProgress from "@/components/create-page/set-creation-progress";



export default function CreatePuzzleSetPage() {
  const maxSetSize = 200;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [setSize, setSetSize] = useState<number>(100);
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
        <h1 className=" pt-6 text-3xl font-bold mb-6"></h1>

        <div
          className="rounded-xl p-[2px] transition-all duration-300"
          style={{
            boxShadow: "0 0 12px red",
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
