import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartDatum = {
  day: string;
  value: number;
};

const ChartCard = ({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: ChartDatum[];
  dataKey: "value"; // literal since all charts pass { day, value }
}) => (
  <div className="bg-card text-card-foreground rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <YAxis allowDecimals={false} width={55} />
        <XAxis dataKey="day" tickFormatter={(day) => new Date(day).toLocaleDateString()} />

        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ChartCard;
