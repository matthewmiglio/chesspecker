import CumulativeUsersOverTime from "./CumulativeUsersOverTime"; // Import the new chart
import { TimeSeriesPoint } from "@/lib/types";
import { CreatesOverTime } from "./CreatesOverTime";
import { PuzzlesOverTime } from "./PuzzlesOverTime";
import { RequestsOverTime } from "./RequestsOverTime";
import { StartsOverTime } from "./StartsOverTime";
import { CurrentTotals } from "./CurrentTotals";
import StreaksBarGraph from "./StreaksBarGraph";
import { Streak } from "@/lib/types";



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
      <CreatesOverTime data={creates} />
      <PuzzlesOverTime data={puzzles} />
      <RequestsOverTime data={requests} />
      <StartsOverTime data={starts} />
      <CumulativeUsersOverTime userStats={userStats} />
      <StreaksBarGraph data={streaks} /> {/* New figure */}
    </div>
  );
}

