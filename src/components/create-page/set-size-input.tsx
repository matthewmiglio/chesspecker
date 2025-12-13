import { Minus, Plus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SetSizeInputProps = {
  value: number;
  onChange: (value: number) => void;
  isPremium?: boolean;
};

const STEP = 100;
const MIN_SIZE = 100;
const FREE_MAX_SIZE = 100;
const PREMIUM_MAX_SIZE = 500;

export default function SetSizeInput({ value, onChange, isPremium = false }: SetSizeInputProps) {
  const maxSize = isPremium ? PREMIUM_MAX_SIZE : FREE_MAX_SIZE;
  const minSize = MIN_SIZE;

  const handleDecrement = () => {
    if (value > minSize) onChange(value - STEP);
  };

  const handleIncrement = () => {
    if (value < maxSize) onChange(value + STEP);
  };

  // Calculate segments based on current max
  const segmentCount = (maxSize - minSize) / STEP + 1;
  const segments = Array.from({ length: Math.max(1, segmentCount - 1) }, (_, i) => {
    const segmentStart = minSize + (i * STEP);
    const segmentEnd = segmentStart + STEP;
    const isFilled = value >= segmentEnd;
    const isPartial = value >= segmentStart && value < segmentEnd;

    return {
      filled: isFilled,
      partial: isPartial,
      progress: isPartial ? ((value - segmentStart) / STEP) * 100 : 0
    };
  });

  return (
    <div className="flex flex-col mt-2 mb-2 items-left gap-3">
      <div className="flex items-center gap-4">
        <Button type="button" size="icon" variant="outline" onClick={handleDecrement} disabled={value <= minSize}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-lg font-medium w-12 text-center">{value}</span>
        <Button type="button" size="icon" variant="outline" onClick={handleIncrement} disabled={value >= maxSize}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {segments.map((segment, index) => (
          <div key={index} className="relative w-8 h-2 bg-gray-700 rounded-sm overflow-hidden">
            {segment.filled && (
              <div className="absolute inset-0 bg-red-500" />
            )}
            {segment.partial && (
              <div
                className="absolute inset-0 bg-red-500 transition-all duration-200"
                style={{ width: `${segment.progress}%` }}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{value}/{maxSize}</span>
      </div>

      {!isPremium && (
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 text-xs text-[var(--theme-color)] hover:underline"
        >
          <Crown className="w-3.5 h-3.5" />
          Upgrade to Premium for up to {PREMIUM_MAX_SIZE} puzzles per set
        </Link>
      )}
    </div>
  );
}
