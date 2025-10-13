"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { RepeatAccuracy } from "@/lib/types";
import type { ChessPeckerSet } from "@/types/chessPeckerSet";
import AccuracyChartCard from "@/components/dashboard-page/AccuracyChartCard";
import SetTabs from "@/components/dashboard-page/SetTabs";
import NoDataCard from "@/components/dashboard-page/NoDataCard";
import { getUserSets } from "@/lib/api/setsApi";
import { fetchAccuracyData } from "@/lib/hooks/fetchAccuracyData";

// Extend RepeatAccuracy to include percent fields
type PercentifiedAccuracy = RepeatAccuracy & {
  correctPercent: number;
  incorrectPercent: number;
};

export default function AccuracyStatsPage() {
  const { data: session, status } = useSession();

  const [userSets, setUserSets] = useState<ChessPeckerSet[]>([]);
  const [accuracyData, setAccuracyData] = useState<PercentifiedAccuracy[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSetsChecked, setIsSetsChecked] = useState(false);
  const [isAccuracyChecked, setIsAccuracyChecked] = useState(false);

  // Step 1: Auth & Fetch Sets
  useEffect(() => {
    const run = async () => {
      console.log('[Dashboard] Auth status:', status);

      if (status !== "authenticated") {
        console.log('[Dashboard] Not authenticated, skipping fetch');
        setIsAuthChecked(true);
        setIsSetsChecked(true);
        return;
      }

      if (!session?.user?.email) {
        console.log('[Dashboard] No user email in session');
        return;
      }

      console.log('[Dashboard] Authenticated user:', session.user.email);
      setIsAuthChecked(true);

      console.log('[Dashboard] Fetching user sets');
      const sets = await getUserSets();
      console.log('[Dashboard] User sets retrieved:', sets, 'Count:', sets.length);

      setUserSets(sets);
      if (sets.length > 0) {
        console.log('[Dashboard] Setting selected set to:', sets[0].set_id);
        setSelectedSetId(sets[0].set_id);
      } else {
        console.log('[Dashboard] No sets found for user');
      }

      setIsSetsChecked(true);
    };

    run();
  }, [status, session]);

  // Step 2: Fetch Accuracy
  useEffect(() => {
    console.log('[Dashboard] Selected set ID changed:', selectedSetId);
    if (selectedSetId !== null) {
      console.log('[Dashboard] Fetching accuracy data for set:', selectedSetId);
      fetchAccuracyData(selectedSetId, setAccuracyData, setIsAccuracyChecked);
    } else {
      console.log('[Dashboard] No set selected yet');
      // If no sets available and sets have been checked, mark accuracy as checked too
      if (isSetsChecked && userSets.length === 0) {
        console.log('[Dashboard] No sets available, marking accuracy as checked');
        setIsAccuracyChecked(true);
      }
    }
  }, [selectedSetId, isSetsChecked, userSets.length]);


  // Get the selected set to check its repeat_index and puzzle_index
  const selectedSet = userSets.find((set) => set.set_id === selectedSetId);

  // Calculate number of fully completed repeats
  // A repeat is fully completed when puzzle_index has reached the end (size) and moved to next repeat
  const completedRepeats = selectedSet ? selectedSet.repeat_index : 0;
  const hasInsufficientRepeats = completedRepeats < 2;

  // Filter accuracy data to only show completed repeats
  // Only include data for repeat indices 0 to (completedRepeats - 1)
  const filteredAccuracyData = accuracyData.filter(
    (data) => data.repeat < completedRepeats
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Puzzle Set Accuracy</h1>

      {isAuthChecked && isSetsChecked && isAccuracyChecked ? (
        <>
          {userSets.length > 0 && selectedSetId !== null && (
            <SetTabs
              userSets={userSets}
              selectedSetId={selectedSetId}
              setSelectedSetId={setSelectedSetId}
            />
          )}

          {userSets.length === 0 ? (
            <NoDataCard noSets />
          ) : hasInsufficientRepeats ? (
            <NoDataCard hasInsufficientRepeats />
          ) : filteredAccuracyData.length > 0 ? (
            <AccuracyChartCard accuracyData={filteredAccuracyData} />
          ) : (
            <NoDataCard />
          )}
        </>
      ) : (
        <div className="animate-pulse text-muted-foreground py-12 text-center">
          Loading your dashboard...
        </div>
      )}
    </div>
  );
}
