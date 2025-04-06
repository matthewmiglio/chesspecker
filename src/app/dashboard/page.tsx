"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export default function AccuracyStatsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userSets, setUserSets] = useState<any[]>([]);
  const [accuracyData, setAccuracyData] = useState<any[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("user_id");
    if (id) {
      setUserId(id);
      fetchUserSets(id);
    }
  }, []);

  const fetchUserSets = async (uid: string) => {
    const res = await fetch("/api/getSet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: uid }),
    });
    const result = await res.json();
    setUserSets(result.sets);
    if (result.sets.length > 0) {
      setSelectedSetId(result.sets[0].set_id);
    }
  };

  const fetchAccuracy = async (set_id: number) => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fetch("/api/getSetAccuracy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ set_id, repeat_index: i }),
        }).then((res) => res.json())
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

  useEffect(() => {
    if (selectedSetId !== null) {
      fetchAccuracy(selectedSetId);
    }
  }, [selectedSetId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Puzzle Set Accuracy</h1>

      <Tabs defaultValue={selectedSetId?.toString()} className="mb-8">
        <TabsList className="flex flex-wrap gap-2">
          {userSets.map((set) => (
            <TabsTrigger
              key={set.set_id}
              value={set.set_id.toString()}
              onClick={() => setSelectedSetId(set.set_id)}
              className={cn(
                "text-sm px-3 py-1",
                selectedSetId === set.set_id && "border border-primary"
              )}
            >
              {set.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Repeat Accuracy Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <XAxis dataKey="repeat" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="correct" fill="#4ade80" name="Correct" />
                <Bar dataKey="incorrect" fill="#f87171" name="Incorrect" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No accuracy data available for this set.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
