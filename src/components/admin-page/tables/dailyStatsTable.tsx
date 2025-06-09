"use client";

import { useSortableTable } from "@/lib/hooks/useSortableTable";

type DailyStats = {
  day: string;
  correct_puzzles: number;
  incorrect_puzzles: number;
  puzzle_starts: number;
  set_creates: number;
  puzzle_requests: number;
};

export default function DailyStatsTable({ data }: { data: DailyStats[] }) {
  const { sortedData, requestSort, sortConfig } = useSortableTable<DailyStats>(data);

  const headers: { key: keyof DailyStats; label: string }[] = [
    { key: "day", label: "Date" },
    { key: "puzzle_starts", label: "Starts" },
    { key: "puzzle_requests", label: "Requests" },
    { key: "correct_puzzles", label: "Correct" },
    { key: "incorrect_puzzles", label: "Incorrect" },
    { key: "set_creates", label: "Set Creates" },
  ];

  return (
<div className="overflow-x-auto rounded-lg border border-gray-300 w-full">
      <table className="w-full table-auto text-xs sm:text-[10px] md:text-sm text-left">


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
          {sortedData.map((stat, idx) => (
            <tr key={idx} className="border-t border-gray-200">
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.day}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.puzzle_starts}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.puzzle_requests}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.correct_puzzles}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.incorrect_puzzles}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{stat.set_creates}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
