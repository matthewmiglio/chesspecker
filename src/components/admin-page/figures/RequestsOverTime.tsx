import ChartCard from './ChartCard';

export const RequestsOverTime = ({ data }: { data: any[] }) => (
    <ChartCard title="Puzzle Requests Over Time" data={data} dataKey="puzzle_requests" />
  );
