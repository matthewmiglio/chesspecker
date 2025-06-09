"use client";

import { useSortableTable } from "@/lib/hooks/useSortableTable";

type AccuracyData = {
  set_id: string;
  repeat_index: number;
  correct: number;
  incorrect: number;
};

type AccuracyRow = AccuracyData & {
  accuracy: string; // e.g. "97.0%"
};

export default function AccuraciesTable({ data }: { data: AccuracyData[] }) {
  // Compute accuracy beforehand
  const computedData: AccuracyRow[] = data.map((item) => {
    const total = item.correct + item.incorrect;
    const accuracy = total === 0 ? "—" : `${((item.correct / total) * 100).toFixed(1)}%`;
    return { ...item, accuracy };
  });

  const {
    sortedData,
    requestSort,
    sortConfig,
  } = useSortableTable<AccuracyRow>(computedData);

  const headers: { key: keyof AccuracyRow; label: string }[] = [
    { key: "set_id", label: "Set ID" },
    { key: "repeat_index", label: "Repeat Index" },
    { key: "correct", label: "Correct" },
    { key: "incorrect", label: "Incorrect" },
    { key: "accuracy", label: "Accuracy" },
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
          {sortedData.map((item, idx) => (
            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-3">{item.set_id}</td>
              <td className="p-3">{item.repeat_index}</td>
              <td className="p-3">{item.correct}</td>
              <td className="p-3">{item.incorrect}</td>
              <td className="p-3">{item.accuracy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
