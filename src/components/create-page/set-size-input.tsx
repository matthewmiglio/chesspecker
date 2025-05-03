import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type SetSizeInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const STEP = 10;

export default function SetSizeInput({ value, onChange }: SetSizeInputProps) {
  const handleDecrement = () => {
    if (value > 1) onChange(value - STEP);
  };

  const handleIncrement = () => {
    if (value < 200) onChange(value + STEP);
  };

  return (
    <div className="flex items-center gap-4">
      <Button type="button" size="icon" variant="outline" onClick={handleDecrement}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-lg font-medium w-12 text-center">{value}</span>
      <Button type="button" size="icon" variant="outline" onClick={handleIncrement}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
