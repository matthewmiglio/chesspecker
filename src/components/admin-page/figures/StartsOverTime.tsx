import ChartCard from './ChartCard';

export const StartsOverTime = ({ data }: { data: any[] }) => (
    <ChartCard title="Puzzle Starts Over Time" data={data} dataKey="puzzle_starts" />
);
