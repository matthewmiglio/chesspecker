import { CreatesOverTime } from './CreatesOverTime';
import { CurrentTotals } from './CurrentTotals';
import { PuzzlesOverTime } from './PuzzlesOverTime';
import { RequestsOverTime } from './RequestsOverTime';
import { StartsOverTime } from './StartsOverTime';




import { TimeSeriesPoint } from '@/lib/types';

export default function FiguresDashboard({
    creates,
    puzzles,
    requests,
    starts,
    totals,
}: {
    creates: TimeSeriesPoint[];
    puzzles: TimeSeriesPoint[];
    requests: TimeSeriesPoint[];
    starts: TimeSeriesPoint[];
    totals: Record<string, number>;
}) {
    return (
        <div className="space-y-6">
            <CurrentTotals totals={totals} />
            <CreatesOverTime data={creates} />
            <PuzzlesOverTime data={puzzles} />
            <RequestsOverTime data={requests} />
            <StartsOverTime data={starts} />
        </div>
    );
}
