"use client";

import {Streak} from "@/lib/types";

export default function StreaksTable({ data }: { data: Streak[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-800 font-semibold">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Login Streak</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-3">{row.email}</td>
              <td className="p-3">{row.login_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
