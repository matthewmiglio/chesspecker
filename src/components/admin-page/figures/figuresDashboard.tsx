//this will hold all the figures together in one place!
import {CreatesOverTime} from './CreatesOverTime';
import {CurrentTotals} from './CurrentTotals';
import {PuzzlesOverTime} from './PuzzlesOverTime';
import {StartsOverTime} from './StartsOverTime';
import {RequestsOverTime} from './RequestsOverTime';

export default function FiguresDashboard({
    creates,
    puzzles,
    requests,
    starts,
    totals
}: {
    creates: any[],
    puzzles: any[],
    requests: any[],
    starts: any[],
    totals: Record<string, number>
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
