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
import type { TooltipProps } from "recharts";

interface AccuracyChartCardProps {
  accuracyData: {
    repeat: number;
    correct: number;
    incorrect: number;
    correctPercent: number;
    incorrectPercent: number;
    time_taken?: number;
  }[];
}

const formatTime = (seconds: number | null | undefined): string => {
  if (!seconds) return "N/A";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as AccuracyChartCardProps["accuracyData"][0] & {
      avgTimePerPuzzle: number;
    };
    const total = data.correct + data.incorrect;

    return (
      <div className="rounded-lg bg-background border p-3 shadow-lg min-w-[220px]">
        <p className="font-semibold text-lg mb-3">Repeat #{label}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-medium">✅ Correct</span>
            <span className="font-bold text-lg">{data.correct}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-600 font-medium">❌ Incorrect</span>
            <span className="font-bold text-lg">{data.incorrect}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-blue-600 font-medium">⏱️ Avg Time/Puzzle</span>
            <span className="font-bold text-lg">
              {data.time_taken ? formatTime(data.avgTimePerPuzzle) : "N/A"}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>{total > 0 ? ((data.correct / total) * 100).toFixed(1) : 0}%</span>
          </div>
          {data.time_taken && (
            <div className="flex justify-between">
              <span>Total time:</span>
              <span>{formatTime(data.time_taken)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};



export default function AccuracyChartCard({
  accuracyData,
}: AccuracyChartCardProps) {
  const themeColor = useThemeAccentColor();

  // Prepare data for the 3-bar chart
  const chartData = accuracyData.map(item => {
    const total = item.correct + item.incorrect;
    const avgTimePerPuzzle = item.time_taken && total > 0 ? item.time_taken / total : 0;

    return {
      ...item,
      avgTimePerPuzzle,
    };
  });

  // Find the maximum values for scaling
  const maxCount = Math.max(
    ...chartData.map(item => Math.max(item.correct, item.incorrect))
  );
  const maxTime = Math.max(...chartData.map(item => item.avgTimePerPuzzle));

  return (
    <div
      className="transition-all duration-300"
      style={{
        boxShadow: `0 0 3px 0px ${themeColor}`,
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Overview</span>
            <span className="text-sm text-muted-foreground font-normal">
              Count & Avg Time per Puzzle
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[450px]">
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
                barCategoryGap="30%"
                barGap={6}
              >
                <XAxis
                  dataKey="repeat"
                  tickFormatter={(value) => `Repeat ${value}`}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />

                {/* Left Y-axis for counts */}
                <YAxis
                  yAxisId="count"
                  orientation="left"
                  domain={[0, Math.ceil(maxCount * 1.1)]}
                  tick={{ fontSize: 11 }}
                  width={40}
                />

                {/* Right Y-axis for time */}
                <YAxis
                  yAxisId="time"
                  orientation="right"
                  domain={[0, Math.ceil(maxTime * 1.1)]}
                  tickFormatter={(value) => `${Math.round(value)}s`}
                  tick={{ fontSize: 11 }}
                  width={50}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />

                {/* Correct count bar */}
                <Bar
                  yAxisId="count"
                  dataKey="correct"
                  fill="#22c55e"
                  name="✅ Correct"
                  radius={[2, 2, 0, 0]}
                />

                {/* Incorrect count bar */}
                <Bar
                  yAxisId="count"
                  dataKey="incorrect"
                  fill="#ef4444"
                  name="❌ Incorrect"
                  radius={[2, 2, 0, 0]}
                />

                {/* Average time per puzzle bar */}
                <Bar
                  yAxisId="time"
                  dataKey="avgTimePerPuzzle"
                  fill="#3b82f6"
                  name="⏱️ Avg Time/Puzzle (s)"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No accuracy data available for this set.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
