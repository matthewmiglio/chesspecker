import { useState, useMemo } from "react";

type SortDirection = "asc" | "desc";
type SortConfig<T> = { key: keyof T; direction: SortDirection } | null;

export function useSortableTable<T extends Record<string, unknown>>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;

    return [...data].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];



      const parse = (val: unknown): number | string => {
        if (typeof val === "string") {
          if (val.trim().endsWith("%")) {
            return parseFloat(val.replace("%", ""));
          }
          if (!isNaN(Date.parse(val))) {
            return new Date(val).getTime();
          }
          if (!isNaN(Number(val))) {
            return Number(val);
          }
          return val.toLowerCase();
        }

        if (typeof val === "number") {
          return val;
        }

        return ""; // fallback for undefined/null/other types
      };

      const aParsed = parse(valA);
      const bParsed = parse(valB);

      if (aParsed < bParsed) return direction === "asc" ? -1 : 1;
      if (aParsed > bParsed) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return { sortedData, requestSort, sortConfig };
}
