export type SortDirection = "asc" | "desc";
export type SortType = "number" | "string" | "percent" | "date";

export const sortByType = (
  a: any,
  b: any,
  type: SortType,
  direction: SortDirection
) => {
  const [x, y] = direction === "asc" ? [a, b] : [b, a];

  switch (type) {
    case "number":
      return Number(x) - Number(y);
    case "percent":
      return parseFloat(x) - parseFloat(y);
    case "date":
      return new Date(x).getTime() - new Date(y).getTime();
    case "string":
    default:
      return String(x).localeCompare(String(y));
  }
};
