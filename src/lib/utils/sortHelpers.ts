export type SortDirection = "asc" | "desc";
export type SortType = "number" | "string" | "percent" | "date";

export const sortByType = (
  a: string | number | Date,
  b: string | number | Date,
  type: SortType,
  direction: SortDirection
): number => {
  const [x, y] = direction === "asc" ? [a, b] : [b, a];

  switch (type) {
    case "number":
      return Number(x) - Number(y);

    case "percent":
      return parseFloat(String(x).replace("%", "")) - parseFloat(String(y).replace("%", ""));

    case "date":
      return new Date(x).getTime() - new Date(y).getTime();

    case "string":
    default:
      return String(x).localeCompare(String(y));
  }
};
