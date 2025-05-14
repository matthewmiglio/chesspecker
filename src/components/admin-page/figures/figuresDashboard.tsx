import CumulativeUsersOverTime from "./CumulativeUsersOverTime"; // Import the new chart
import { TimeSeriesPoint } from "@/lib/types";
import { CreatesOverTime } from "./CreatesOverTime";
import { PuzzlesOverTime } from "./PuzzlesOverTime";
import { RequestsOverTime } from "./RequestsOverTime";
import { StartsOverTime } from "./StartsOverTime";
import { CurrentTotals } from "./CurrentTotals";

export default function FiguresDashboard({
  creates,
  puzzles,
  requests,
  starts,
  totals,
  userStats, // userStats is passed in here
}: {
  creates: TimeSeriesPoint[];
  puzzles: TimeSeriesPoint[];
  requests: TimeSeriesPoint[];
  starts: TimeSeriesPoint[];
  totals: Record<string, number>;
  userStats: { email: string; created_at: string }[]; // Ensure userStats is the correct type
}) {
  return (
    <div className="space-y-6">
      <CurrentTotals totals={totals} />
      <CreatesOverTime data={creates} />
      <PuzzlesOverTime data={puzzles} />
      <RequestsOverTime data={requests} />
      <StartsOverTime data={starts} />
      <CumulativeUsersOverTime userStats={userStats} /> {/* Pass userStats here */}
    </div>
  );
}
