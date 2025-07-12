"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
import { TimeSeriesPoint } from "@/lib/types";

interface MultiSeries {
  day: string;
  creates?: number;
  puzzles?: number;
  requests?: number;
  starts?: number;
}

const colors: Record<string, string> = {
  creates: "#8884d8",
  puzzles: "#82ca9d",
  requests: "#ffc658",
  starts: "#ff7300",
};

const formatData = (
  creates: TimeSeriesPoint[],
  puzzles: TimeSeriesPoint[],
  requests: TimeSeriesPoint[],
  starts: TimeSeriesPoint[]
): MultiSeries[] => {
  const allDates = Array.from(
    new Set([
      ...creates.map((d) => d.day),
      ...puzzles.map((d) => d.day),
      ...requests.map((d) => d.day),
      ...starts.map((d) => d.day),
    ])
  ).sort();

  return allDates.map((day) => ({
    day,
    creates: creates.find((d) => d.day === day)?.value,
    puzzles: puzzles.find((d) => d.day === day)?.value,
    requests: requests.find((d) => d.day === day)?.value,
    starts: starts.find((d) => d.day === day)?.value,
  }));
};

export const CombinedLineGraph = ({
  creates,
  puzzles,
  requests,
  starts,
}: {
  creates: TimeSeriesPoint[];
  puzzles: TimeSeriesPoint[];
  requests: TimeSeriesPoint[];
  starts: TimeSeriesPoint[];
}) => {
  const data = formatData(creates, puzzles, requests, starts);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    creates: true,
    puzzles: true,
    requests: true,
    starts: true,
  });

  const toggleVisibility = (key: string) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Activity Over Time</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(visible).map((key) => (
          <label key={key} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={visible[key]}
              onChange={() => toggleVisibility(key)}
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickFormatter={(day) => new Date(day).toLocaleDateString()}
          />
          <YAxis allowDecimals={false} width={30} />

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #ccc',
            }}
            labelStyle={{ color: 'grey' }}
          />

          <Legend />
          {Object.entries(visible).map(
            ([key, show]) =>
              show && (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[key]}
                  strokeWidth={2}
                  dot={false}
                />
              )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
