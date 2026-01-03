"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
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

const TimeTooltipDark = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as AccuracyChartCardProps["accuracyData"][0];
    return (
      <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4 shadow-2xl">
        <p className="font-light text-zinc-400 text-xs uppercase tracking-widest mb-2">Repeat {label}</p>
        <p className="text-2xl font-light text-white">{data.time_taken ? formatTime(data.time_taken) : "N/A"}</p>
      </div>
    );
  }
  return null;
};

const AccuracyTooltipDark = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as AccuracyChartCardProps["accuracyData"][0];
    const total = data.correct + data.incorrect;
    const accuracy = total > 0 ? ((data.correct / total) * 100).toFixed(1) : "0";
    return (
      <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4 shadow-2xl min-w-[180px]">
        <p className="font-light text-zinc-400 text-xs uppercase tracking-widest mb-3">Repeat {label}</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-emerald-400 text-sm">Correct</span>
            <span className="text-white font-medium">{data.correct}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rose-400 text-sm">Incorrect</span>
            <span className="text-white font-medium">{data.incorrect}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <p className="text-zinc-400 text-xs">Accuracy: <span className="text-white">{accuracy}%</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// LUNA - Dark with gradient glow
const TimeChartLuna = ({ data }: { data: AccuracyChartCardProps["accuracyData"] }) => (
  <div className="rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 border border-zinc-800">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-zinc-100 font-light text-lg tracking-wide">Time per Repeat</h4>
      <span className="text-zinc-500 text-xs uppercase tracking-widest">seconds</span>
    </div>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="lunaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="repeat" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<TimeTooltipDark />} />
          <Area type="monotone" dataKey="time_taken" stroke="#818cf8" strokeWidth={2} fill="url(#lunaGradient)" dot={{ fill: '#818cf8', r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// AURORA - Dark with stacked area
const AccuracyChartAurora = ({ data }: { data: AccuracyChartCardProps["accuracyData"] }) => (
  <div className="rounded-2xl bg-gradient-to-br from-zinc-950 via-emerald-950/10 to-zinc-950 p-6 border border-zinc-800">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-zinc-100 font-light text-lg tracking-wide">Accuracy Overview</h4>
      <div className="flex gap-4">
        <span className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Correct</span>
        <span className="flex items-center gap-2 text-xs text-zinc-400"><span className="w-3 h-3 rounded-full bg-rose-500" /> Incorrect</span>
      </div>
    </div>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="auroraCorrect" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="auroraIncorrect" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="repeat" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<AccuracyTooltipDark />} />
          <Area type="monotone" dataKey="correct" stroke="#34d399" strokeWidth={2} fill="url(#auroraCorrect)" />
          <Area type="monotone" dataKey="incorrect" stroke="#fb7185" strokeWidth={2} fill="url(#auroraIncorrect)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function AccuracyChartCard({ accuracyData }: AccuracyChartCardProps) {
  const chartData = accuracyData.map(item => ({ ...item }));

  if (accuracyData.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-8">
        <p className="text-zinc-400 text-center">No data available for this set.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TimeChartLuna data={chartData} />
      <AccuracyChartAurora data={chartData} />
    </div>
  );
}
