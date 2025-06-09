import CumulativeUsersOverTime from "./CumulativeUsersOverTime"; 
import { TimeSeriesPoint } from "@/lib/types";
import { CurrentTotals } from "./CurrentTotals";
import StreaksBarGraph from "./StreaksBarGraph";
import { Streak } from "@/lib/types";
import { CombinedLineGraph } from "./CombinedLineGraph";


export default function FiguresDashboard({
  creates,
  puzzles,
  requests,
  starts,
  totals,
  userStats,
  streaks,
}: {
  creates: TimeSeriesPoint[];
  puzzles: TimeSeriesPoint[];
  requests: TimeSeriesPoint[];
  starts: TimeSeriesPoint[];
  totals: Record<string, number>;
  userStats: { email: string; created_at: string }[];
  streaks: Streak[];
}) {
  return (
    <div className="space-y-6">
      <CurrentTotals totals={totals} />
      <CombinedLineGraph
        creates={creates}
        puzzles={puzzles}
        requests={requests}
        starts={starts}
      />
      <CumulativeUsersOverTime userStats={userStats} />
      <StreaksBarGraph data={streaks} />
    </div>
  );
}

