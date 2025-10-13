"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
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

const TimeTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as AccuracyChartCardProps["accuracyData"][0];

    return (
      <div className="rounded-lg bg-background border p-3 shadow-lg min-w-[180px]">
        <p className="font-semibold text-lg mb-2">Repeat #{label}</p>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-medium">Time Taken:</span>
          <span className="font-bold text-lg">
            {data.time_taken ? formatTime(data.time_taken) : "N/A"}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

const AccuracyTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as AccuracyChartCardProps["accuracyData"][0];
    const total = data.correct + data.incorrect;

    return (
      <div className="rounded-lg bg-background border p-3 shadow-lg min-w-[200px]">
        <p className="font-semibold text-lg mb-3">Repeat #{label}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-medium">Correct:</span>
            <span className="font-bold text-lg">{data.correct}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-600 font-medium">Incorrect:</span>
            <span className="font-bold text-lg">{data.incorrect}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>{total > 0 ? ((data.correct / total) * 100).toFixed(1) : 0}%</span>
          </div>
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

  const chartData = accuracyData.map(item => ({
    ...item,
  }));

  return (
    <div className="space-y-6">
      {/* Time Taken Chart */}
      <div
        className="transition-all duration-300"
        style={{
          boxShadow: `0 0 3px 0px ${themeColor}`,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Time Taken per Repeat</span>
              <span className="text-sm text-muted-foreground font-normal">
                Total time in seconds
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="repeat"
                    label={{ value: 'Repeat Index', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<TimeTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="time_taken"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Time Taken (s)"
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  No time data available for this set.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Chart */}
      <div
        className="transition-all duration-300"
        style={{
          boxShadow: `0 0 3px 0px ${themeColor}`,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Accuracy per Repeat</span>
              <span className="text-sm text-muted-foreground font-normal">
                Correct vs Incorrect count
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="repeat"
                    label={{ value: 'Repeat Index', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<AccuracyTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="correct"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Correct"
                    dot={{ fill: '#22c55e', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incorrect"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Incorrect"
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
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
    </div>
  );
}
