import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type ChartDatum = {
  day: string;
  value: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 text-white text-sm p-2 rounded shadow-md">
      <p className="text-xs text-gray-900">{label}</p>
      <p className="font-semibold text-violet-300">
        {payload[0].name} : {payload[0].value}
      </p>
    </div>
  );
};

const ChartCard = ({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: ChartDatum[];
  dataKey: "value";
}) => (
  <div className="bg-card text-card-foreground rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <YAxis allowDecimals={false} width={55} />
        <XAxis
          dataKey="day"
          tickFormatter={(day) => new Date(day).toLocaleDateString()}
        />

        <Tooltip content={<CustomTooltip />} />

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
