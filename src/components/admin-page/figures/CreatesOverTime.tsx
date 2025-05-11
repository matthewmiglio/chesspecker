import ChartCard from './ChartCard';


export const CreatesOverTime = ({ data }: { data: any[] }) => (
    <ChartCard title="Set Creates Over Time" data={data} dataKey="set_creates" />
);
