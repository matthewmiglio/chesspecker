"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { PuzzleSet, RepeatAccuracy } from "@/lib/types";
import AccuracyChartCard from "@/components/dashboard-page/AccuracyChartCard";
import SetTabs from "@/components/dashboard-page/SetTabs";
import NoDataCard from "@/components/dashboard-page/NoDataCard";
import { fetchUserSets } from "@/lib/hooks/fetchUserSets";
import { fetchAccuracyData } from "@/lib/hooks/fetchAccuracyData";

export default function AccuracyStatsPage() {
  const { data: session, status } = useSession();

  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [accuracyData, setAccuracyData] = useState<RepeatAccuracy[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSetsChecked, setIsSetsChecked] = useState(false);
  const [isAccuracyChecked, setIsAccuracyChecked] = useState(false);

  // Step 1: Auth & Fetch Sets
  useEffect(() => {
    const run = async () => {
      if (status !== "authenticated") {
        setIsAuthChecked(true);
        return;
      }

      if (!session?.user?.email) return;

      setIsAuthChecked(true);

      await fetchUserSets(
        session.user.email,
        setUserSets,
        setSelectedSetId,
        setIsSetsChecked
      );
    };

    run();
  }, [status, session]);

  // Step 2: Fetch Accuracy
  useEffect(() => {
    if (selectedSetId !== null) {
      fetchAccuracyData(selectedSetId, setAccuracyData, setIsAccuracyChecked);
    }
  }, [selectedSetId]);

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

          {accuracyData.length > 0 ? (
            <AccuracyChartCard accuracyData={accuracyData} />
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
