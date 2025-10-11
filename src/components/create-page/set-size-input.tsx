import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type SetSizeInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const STEP = 100;
const MIN_SIZE = 200;
const MAX_SIZE = 500;

export default function SetSizeInput({ value, onChange }: SetSizeInputProps) {
  const handleDecrement = () => {
    if (value > MIN_SIZE) onChange(value - STEP);
  };

  const handleIncrement = () => {
    if (value < MAX_SIZE) onChange(value + STEP);
  };

  const segments = Array.from({ length: 5 }, (_, i) => {
    const segmentSize = (MAX_SIZE - MIN_SIZE) / 5; // 160 units per segment
    const segmentStart = MIN_SIZE + (i * segmentSize);
    const segmentEnd = segmentStart + segmentSize;
    const isFilled = value >= segmentEnd;
    const isPartial = value >= segmentStart && value < segmentEnd;
    
    return {
      filled: isFilled,
      partial: isPartial,
      progress: isPartial ? ((value - segmentStart) / segmentSize) * 100 : 0
    };
  });

  return (
    <div className="flex flex-col mt-2 mb-2 items-left gap-3">
      <div className="flex items-center gap-4">
        <Button type="button" size="icon" variant="outline" onClick={handleDecrement}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-lg font-medium w-12 text-center">{value}</span>
        <Button type="button" size="icon" variant="outline" onClick={handleIncrement}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-1">
        {segments.map((segment, index) => (
          <div key={index} className="relative w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden">
            {segment.filled && (
              <div className="absolute inset-0 bg-blue-500 dark:bg-red-500" />
            )}
            {segment.partial && (
              <div 
                className="absolute inset-0 bg-blue-500 dark:bg-red-500 transition-all duration-200" 
                style={{ width: `${segment.progress}%` }}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{value}/{MAX_SIZE}</span>
      </div>
    </div>
  );
}
