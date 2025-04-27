"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AccuracyChartCardProps {
  accuracyData: { repeat: number; correct: number; incorrect: number }[];
}

export default function AccuracyChartCard({ accuracyData }: AccuracyChartCardProps) {
  return (
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
  );
}
