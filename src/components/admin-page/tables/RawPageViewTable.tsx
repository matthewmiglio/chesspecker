"use client";

import { useSortableTable } from "@/lib/hooks/useSortableTable";

type AnalyticsEvent = {
  id: string;
  ts: string;
  path: string;
  referrer: string | null;
  visitor_id: string | null;
  session_id: string | null;
  ua: string | null;
  ip_hash: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export default function RawPageViewTable({ data }: { data: AnalyticsEvent[] }) {
  const {
    sortedData,
    requestSort,
    sortConfig,
  } = useSortableTable<AnalyticsEvent>(data);

  const headers: { key: keyof AnalyticsEvent; label: string }[] = [
    { key: "ts", label: "Timestamp" },
    { key: "path", label: "Page" },
    { key: "referrer", label: "Referrer" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "visitor_id", label: "Visitor ID" },
    { key: "ua", label: "User Agent" },
  ];

  const getSortIndicator = (columnKey: keyof AnalyticsEvent) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "—";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Raw Page View Events</h2>

      {sortedData.length === 0 ? (
        <p className="text-gray-500 italic">No analytics events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="px-4 py-2 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => requestSort(header.key)}
                  >
                    {header.label}{getSortIndicator(header.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((event) => (
                <tr key={event.id} className="border-b border-gray-600 hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm">
                    {formatTimestamp(event.ts)}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">
                    {event.path}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {truncateText(event.referrer, 30)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {event.city || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {event.state || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {event.country || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">
                    {event.visitor_id ? event.visitor_id.substring(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {truncateText(event.ua, 40)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-gray-400 mt-4">
        Showing {sortedData.length} events (limited to 1000 most recent)
      </div>
    </div>
  );
}