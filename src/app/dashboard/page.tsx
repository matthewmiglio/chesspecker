"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserSets(session.user.email);
    }
  }, [status, session]);

  useEffect(() => {
    if (selectedSetId !== null) {
      fetchAccuracy(selectedSetId);
    }
  }, [selectedSetId]);

  const fetchUserSets = async (email: string) => {
    const res = await fetch("/api/getSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    setUserSets(result.sets);
    if (result.sets.length > 0) {
      setSelectedSetId(result.sets[0].set_id);
    }
  };

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

  const fetchAccuracy = async (set_id: number) => {
    const size = await getSetSize(set_id);
    if (!size) return null;

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
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Puzzle Set Accuracy</h1>

      {/* Only show SetTabs if there are sets */}
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
    </div>
  );
}
