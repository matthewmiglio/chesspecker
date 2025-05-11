import ChartCard from './ChartCard';
import { TimeSeriesPoint } from '@/lib/types';

export const RequestsOverTime = ({ data }: { data: TimeSeriesPoint[] }) => (
  <ChartCard title="Puzzle Requests Over Time" data={data} dataKey="value" />
);
