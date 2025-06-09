"use client";

import { useSortableTable } from "@/lib/hooks/useSortableTable";

type User = {
  email: string;
  created_at: string;
  puzzle_starts: number;
  correct_puzzles: number;
  incorrect_puzzles: number;
  set_creates: number;
  hints: number;
  puzzle_requests: number;
};

export default function UsersTable({ data }: { data: User[] }) {
  const {
    sortedData,
    requestSort,
    sortConfig,
  } = useSortableTable<User>(data);

  const headers: { key: keyof User; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "created_at", label: "Joined" },
    { key: "puzzle_starts", label: "Starts" },
    { key: "correct_puzzles", label: "Correct" },
    { key: "incorrect_puzzles", label: "Incorrect" },
    { key: "set_creates", label: "Creates" },
    { key: "hints", label: "Hints" },
    { key: "puzzle_requests", label: "Puzzle Requests" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-800 font-semibold">
          <tr>
            {headers.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => requestSort(key)}
                className="p-3 cursor-pointer select-none"
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
          {sortedData.map((user, idx) => (
            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-3">{user.email}</td>
              <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="p-3">{user.puzzle_starts}</td>
              <td className="p-3">{user.correct_puzzles}</td>
              <td className="p-3">{user.incorrect_puzzles}</td>
              <td className="p-3">{user.set_creates}</td>
              <td className="p-3">{user.hints}</td>
              <td className="p-3">{user.puzzle_requests}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
