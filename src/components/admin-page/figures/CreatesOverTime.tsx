import ChartCard from './ChartCard';
import { TimeSeriesPoint } from '@/lib/types';

export const CreatesOverTime = ({ data }: { data: TimeSeriesPoint[] }) => (
  <ChartCard title="Set Creates Over Time" data={data} dataKey="value" />
);
