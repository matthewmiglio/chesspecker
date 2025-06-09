import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimeSeriesPoint } from "@/lib/types";

interface TooltipPayloadItem {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 text-white text-sm p-2 rounded shadow-md">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-violet-300">
        Cumulative Users: {payload[0].value}
      </p>
    </div>
  );
};

const CumulativeUsersOverTime = ({
  userStats,
}: {
  userStats: { email: string; created_at: string }[];
}) => {
  const [data, setData] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const cumulativeUsers: { [key: string]: number } = {};

      userStats.forEach(({ created_at }) => {
        const joinDate = new Date(created_at).toLocaleDateString();
        cumulativeUsers[joinDate] = (cumulativeUsers[joinDate] || 0) + 1;
      });

      const sortedDates = Object.keys(cumulativeUsers).sort();

      const cumulativeData: TimeSeriesPoint[] = sortedDates.map(
        (date, index) => {
          const cumulativeValue = sortedDates
            .slice(0, index + 1)
            .reduce((sum, date) => sum + cumulativeUsers[date], 0);

          return {
            day: date,
            value: cumulativeValue,
          };
        }
      );

      setData(cumulativeData);
    };

    loadData();
  }, [userStats]);

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Cumulative Users Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
  <LineChart
    data={data}
    margin={{ top: 10, right: 20, left: 10, bottom: 10 }} // ⬅️ tighter left
  >
    <CartesianGrid strokeDasharray="2 2" stroke="#444" strokeWidth={0.5} />
    <YAxis allowDecimals={false} width={30} /> {/* ⬅️ tighter axis */}
    <XAxis
      dataKey="day"
      tickFormatter={(day) => new Date(day).toLocaleDateString()}
    />
    <Tooltip content={<CustomTooltip />} />
    <Line
      type="monotone"
      dataKey="value"
      stroke="#8884d8"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>

    </div>
  );
};

export default CumulativeUsersOverTime;
