import type { FC } from "react";
import { cn } from "@/lib/utils";

type RepeatCountInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const options = [3, 4, 5, 6, 7, 8];

const RepeatCountInput: FC<RepeatCountInputProps> = ({ value, onChange }) => {
  const getColorForCount = (count: number) => {
    const colors = {
      3: { bg: "rgb(34, 197, 94)", bgHover: "rgb(22, 163, 74)", text: "white" }, // green-500/green-600
      4: { bg: "rgb(132, 204, 22)", bgHover: "rgb(101, 163, 13)", text: "white" }, // lime-500/lime-600
      5: { bg: "rgb(234, 179, 8)", bgHover: "rgb(202, 138, 4)", text: "white" }, // yellow-500/yellow-600
      6: { bg: "rgb(249, 115, 22)", bgHover: "rgb(234, 88, 12)", text: "white" }, // orange-500/orange-600
      7: { bg: "rgb(249, 115, 22)", bgHover: "rgb(234, 88, 12)", text: "white" }, // orange-500/orange-600
      8: { bg: "rgb(239, 68, 68)", bgHover: "rgb(220, 38, 38)", text: "white" }, // red-500/red-600
    };
    return colors[count as keyof typeof colors];
  };

  return (
    <div className="flex mt-2 mb-2 flex-wrap gap-2">
      {options.map((count) => {
        const colors = getColorForCount(count);
        const isSelected = value === count;
        
        return (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={cn(
              "w-10 h-10 rounded-md border text-sm font-medium transition-all duration-200 transform",
              isSelected 
                ? "scale-110 shadow-lg border-2 border-white ring-2 ring-offset-2 ring-offset-background"
                : "hover:scale-105 border-transparent"
            )}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = colors.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = colors.bg;
              }
            }}
          >
            {count}
          </button>
        );
      })}
    </div>
  );
};

export default RepeatCountInput;
