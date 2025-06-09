"use client";

import { useSortableTable } from "@/lib/hooks/useSortableTable";

type SetData = {
  set_id: string;
  name: string;
  email: string;
  elo: number;
  size: number;
  repeats: number;
  create_time: string;
};

export default function SetsTable({ data }: { data: SetData[] }) {
  const {
    sortedData,
    requestSort,
    sortConfig,
  } = useSortableTable<SetData>(data);

  const headers: { key: keyof SetData; label: string }[] = [
    { key: "set_id", label: "Set ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Creator" },
    { key: "elo", label: "ELO" },
    { key: "size", label: "Size" },
    { key: "repeats", label: "Repeats" },
    { key: "create_time", label: "Created" },
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
          {sortedData.map((set, idx) => (
            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-3">{set.set_id}</td>
              <td className="p-3">{set.name}</td>
              <td className="p-3">{set.email}</td>
              <td className="p-3">{set.elo}</td>
              <td className="p-3">{set.size}</td>
              <td className="p-3">{set.repeats}</td>
              <td className="p-3">
                {new Date(set.create_time).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
