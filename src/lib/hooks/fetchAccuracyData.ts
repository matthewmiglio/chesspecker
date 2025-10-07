import type { RepeatAccuracy } from "@/lib/types";
import { getAccuracies } from "@/lib/api/accuraciesApi";

type PercentifiedAccuracy = RepeatAccuracy & {
  correctPercent: number;
  incorrectPercent: number;
};

export const fetchAccuracyData = async (
  set_id: number,
  setAccuracyData: React.Dispatch<React.SetStateAction<PercentifiedAccuracy[]>>,
  setIsAccuracyChecked: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log('[fetchAccuracyData] Starting fetch for set_id:', set_id);

  try {
    // Fetch all accuracies for this set using the new RPC-based API
    console.log('[fetchAccuracyData] Calling getAccuracies API');
    const accuracies = await getAccuracies(set_id);
    console.log('[fetchAccuracyData] Accuracies received:', accuracies, 'Count:', accuracies.length);

    if (!accuracies || accuracies.length === 0) {
      console.warn('[fetchAccuracyData] No accuracies found');
      setAccuracyData([]);
      setIsAccuracyChecked(true);
      return;
    }

    // Transform accuracies into the format expected by the chart
    const processed = accuracies
      .map((acc) => {
        const correct = acc.correct || 0;
        const incorrect = acc.incorrect || 0;
        const total = correct + incorrect;

        const entry = {
          repeat: acc.repeat_index,
          correct,
          incorrect,
          time_taken: acc.time_taken ?? undefined,
          correctPercent: total > 0 ? (correct / total) * 100 : 0,
          incorrectPercent: total > 0 ? (incorrect / total) * 100 : 0,
        };

        console.log(`[fetchAccuracyData] Repeat ${acc.repeat_index} processed:`, entry);
        return entry;
      })
      .filter((d) => {
        const hasData = d.correct > 0 || d.incorrect > 0;
        console.log(`[fetchAccuracyData] Repeat ${d.repeat} has data:`, hasData);
        return hasData;
      });

    console.log('[fetchAccuracyData] Filtered accuracy data:', processed, 'Count:', processed.length);
    setAccuracyData(processed);
  } catch (err) {
    console.error('[fetchAccuracyData] Error fetching accuracies:', err);
    setAccuracyData([]);
  } finally {
    setIsAccuracyChecked(true);
  }
};
