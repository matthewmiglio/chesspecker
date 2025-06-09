"use client";

import { Streak } from "@/lib/types";
import { useSortableTable } from "@/lib/hooks/useSortableTable";

export default function StreaksTable({ data }: { data: Streak[] }) {
  const {
    sortedData,
    requestSort,
    sortConfig,
  } = useSortableTable<Streak>(data);

  const headers: { key: keyof Streak; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "login_count", label: "Login Streak" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="w-full table-fixed text-[8px] sm:text-xs text-left">

        <thead className="bg-gray-100 text-gray-800 font-semibold">
          <tr>
            {headers.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => requestSort(key)}
                className="p-1 truncate whitespace-nowrap overflow-hidden"
              >
                {label}
                {sortConfig?.key === key && (
                  <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className="border-t border-gray-200">
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{row.email}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{row.login_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
