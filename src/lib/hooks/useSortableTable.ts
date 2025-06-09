// src/lib/hooks/useSortableTable.ts

import { useState, useMemo } from "react";

type SortDirection = "asc" | "desc";
type SortConfig<T> = { key: keyof T; direction: SortDirection } | null;

export function useSortableTable<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;

    return [...data].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      const isPercent = typeof valA === "string" && valA.toString().endsWith("%");
      const isDate = typeof valA === "string" && Date.parse(valA);

      const parse = (val: any) => {
        if (isPercent) return parseFloat(val.toString().replace("%", ""));
        if (isDate && !isNaN(Date.parse(val))) return new Date(val).getTime();
        if (!isNaN(Number(val))) return Number(val);
        return val?.toString().toLowerCase() ?? "";
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
