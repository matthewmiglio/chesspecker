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
          {sortedData.map((set, idx) => (
            <tr key={idx} className="border-t border-gray-200">
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.set_id}</td>
              {/* <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.name}</td> */}
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.name.length > 10 ? set.name.slice(0, 10)  : set.name}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.email.length > 10 ? set.email.slice(0, 10)  : set.email}</td>

              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.elo}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.size}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">{set.repeats}</td>
              <td className="p-1 truncate whitespace-nowrap overflow-hidden">
                {new Date(set.create_time).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
