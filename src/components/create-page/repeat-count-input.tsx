import type { FC } from "react";
import { cn } from "@/lib/utils";

type RepeatCountInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const options = [3, 4, 5, 6, 7, 8];

const RepeatCountInput: FC<RepeatCountInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => onChange(count)}
          className={cn(
            "w-10 h-10 rounded-md border text-sm font-medium transition-colors",
            value === count
              ? "bg-white text-black shadow border-white"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          {count}
        </button>
      ))}
    </div>
  );
};

export default RepeatCountInput;
