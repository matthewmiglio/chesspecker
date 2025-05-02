"use client";

import { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import type { PuzzleSet, RepeatAccuracy } from "@/lib/types";
import AccuracyChartCard from "@/components/dashboard-page/AccuracyChartCard";
import SetTabs from "@/components/dashboard-page/SetTabs";
import NoDataCard from "@/components/dashboard-page/NoDataCard";

export default function AccuracyStatsPage() {
  const { data: session, status } = useSession();

  const [userSets, setUserSets] = useState<PuzzleSet[]>([]);
  const [accuracyData, setAccuracyData] = useState<RepeatAccuracy[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isSetsChecked, setIsSetsChecked] = useState(false);
  const [isAccuracyChecked, setIsAccuracyChecked] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (status !== "authenticated") {
        setIsAuthChecked(true);
        return;
      }

      if (!session?.user?.email) {
        return;
      }
      setIsAuthChecked(true);

      const res = await fetch("/api/getSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!res.ok) {
        setIsSetsChecked(true); // even if fetch fails, we must set it
        return;
      }

      const result = await res.json();
      setUserSets(result.sets || []);

      if (result.sets?.length > 0) {
        setSelectedSetId(result.sets[0].set_id);
      }

      setIsSetsChecked(true); // ✅ move this OUTSIDE the if-block, always set
    };

    run();
  }, [status, session]);

  useEffect(() => {
    if (selectedSetId !== null) {
      fetchAccuracy(selectedSetId);
    }
  }, [selectedSetId]);

  const getSetSize = async (set_id: number) => {
    const response = await fetch("/api/getSetProgressStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    return result.progress.size;
  };

  const fetchAccuracy = useCallback(
    async (set_id: number) => {
      const size = await getSetSize(set_id);
      if (!size) {
        setIsAccuracyChecked(true);
        return;
      }

      const responses = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          fetch("/api/getSetAccuracy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ set_id, repeat_index: i }),
          })
            .then((res) => (res.ok ? res.json() : { correct: 0, incorrect: 0 }))
            .catch(() => ({ correct: 0, incorrect: 0 }))
        )
      );

      const filtered = responses
        .map((data, i) => ({
          repeat: i,
          correct: data.correct || 0,
          incorrect: data.incorrect || 0,
        }))
        .filter((d) => d.correct > 0 || d.incorrect > 0);

      setAccuracyData(filtered);
      setIsAccuracyChecked(true);
    },
    [getSetSize]
  ); // include getSetSize in deps if it's also declared in component

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
