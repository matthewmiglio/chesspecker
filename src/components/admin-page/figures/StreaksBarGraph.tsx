"use client";

import { Streak } from "@/lib/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Utility to clean email to just username
const getUsername = (email: string) =>
  email.length > 10 ? email.slice(0, 10)  : email;

const StreaksBarGraph = ({ data }: { data: Streak[] }) => {
  const sorted = [...data].sort((a, b) => b.login_count - a.login_count);

  // Convert data for display
  const displayData = sorted.map((entry) => ({
    ...entry,
    email: getUsername(entry.email),
  }));

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Login Streaks by User</h3>
      <ResponsiveContainer width="100%" height={600}> {/* Increased height */}
        <BarChart
  layout="vertical"
  data={displayData}
  margin={{ top: 10, right: 20, left: 20, bottom: 10 }} // ⬅️ reduced left
>
          <CartesianGrid strokeDasharray="2 2" stroke="#444" strokeWidth={0.5} />

          <XAxis type="number" allowDecimals={false} />
          <YAxis
    dataKey="email"
    type="category"
    width={80} // ⬅️ reduced width
    tick={{ fontSize: 11 }}
  />
          <Tooltip />
          <Bar dataKey="login_count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreaksBarGraph;
