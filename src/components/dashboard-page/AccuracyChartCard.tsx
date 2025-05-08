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
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
interface AccuracyChartCardProps {
  accuracyData: { repeat: number; correct: number; incorrect: number }[];
}

export default function AccuracyChartCard({
  accuracyData,
}: AccuracyChartCardProps) {
  const themeColor = useThemeAccentColor();
  return (
    <div
      className="transition-all duration-300"
      style={{
        boxShadow: `0 0 3px 0px ${themeColor}`,
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Repeat Accuracy Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accuracyData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                barCategoryGap="20%"
                barGap={2}
              >
                <XAxis dataKey="repeat" />
                <YAxis width={28} allowDecimals={false} />
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
