import ChartCard from './ChartCard';

export const PuzzlesOverTime = ({ data }: { data: any[] }) => (
    <ChartCard title="Total Puzzles Played Over Time" data={data} dataKey="puzzles_total" />
  );
