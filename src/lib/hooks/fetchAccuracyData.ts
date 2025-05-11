import type { RepeatAccuracy } from "@/lib/types";

type PercentifiedAccuracy = RepeatAccuracy & {
  correctPercent: number;
  incorrectPercent: number;
};

export const fetchAccuracyData = async (
  set_id: number,
  setAccuracyData: React.Dispatch<React.SetStateAction<PercentifiedAccuracy[]>>,
  setIsAccuracyChecked: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const getSetSize = async () => {
    const response = await fetch("/api/sets/getSetProgressStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_id }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    return result.progress.size;
  };

  const size = await getSetSize();
  if (!size) {
    setIsAccuracyChecked(true);
    return;
  }

  const responses = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      fetch("/api/accuracy/getSetAccuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id, repeat_index: i }),
      })
        .then((res) => (res.ok ? res.json() : { correct: 0, incorrect: 0 }))
        .catch(() => ({ correct: 0, incorrect: 0 }))
    )
  );

  const filtered = responses
    .map((data, i) => {
      const correct = data.correct || 0;
      const incorrect = data.incorrect || 0;
      const total = correct + incorrect;

      return {
        repeat: i,
        correct,
        incorrect,
        correctPercent: total > 0 ? (correct / total) * 100 : 0,
        incorrectPercent: total > 0 ? (incorrect / total) * 100 : 0,
      };
    })
    .filter((d) => d.correct > 0 || d.incorrect > 0);

  setAccuracyData(filtered);
  setIsAccuracyChecked(true);
};
