import { PuzzleSet } from "@/lib/types";

export const fetchUserSets = async (
  email: string,
  setUserSets: React.Dispatch<React.SetStateAction<PuzzleSet[]>>,
  setSelectedSetId: React.Dispatch<React.SetStateAction<number | null>>,
  setIsSetsChecked: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const res = await fetch("/api/getSet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    setIsSetsChecked(true);
    return;
  }

  const result = await res.json();
  const sets = result.sets || [];

  setUserSets(sets);
  if (sets.length > 0) {
    setSelectedSetId(sets[0].set_id);
  }

  setIsSetsChecked(true);
};
