import ChartCard from './ChartCard';
import { TimeSeriesPoint } from '@/lib/types';

export const StartsOverTime = ({ data }: { data: TimeSeriesPoint[] }) => (
  <ChartCard title="Puzzle Starts Over Time" data={data} dataKey="value" />
);
