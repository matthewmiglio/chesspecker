import ChartCard from './ChartCard';
import { TimeSeriesPoint } from '@/lib/types';

export const PuzzlesOverTime = ({ data }: { data: TimeSeriesPoint[] }) => (
  <ChartCard title="Total Puzzles Played Over Time" data={data} dataKey="value" />
);
