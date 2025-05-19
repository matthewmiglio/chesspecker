"use client";

import { Streak } from "@/lib/types";


import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StreaksBarGraph = ({ data }: { data: Streak[] }) => {
  const sorted = [...data].sort((a, b) => b.login_count - a.login_count);

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Login Streaks by User</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="email" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="login_count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreaksBarGraph;
