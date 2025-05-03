"use client";

import type React from "react";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type RepeatCountInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const MIN = 1;
const MAX = 14;
const COMMON_VALUES = [3, 4, 5, 6, 7, 8];

export default function RepeatCountInput({ value, onChange }: RepeatCountInputProps) {
  const clamp = useCallback((val: number) => Math.max(MIN, Math.min(MAX, val)), []);

  return (
    <div className="space-y-8">
      {/* Label */}
      <Label className="text-sm font-medium block">Repeat Count</Label>

      {/* --- 1. Segmented Button Row --- */}
      <div className="flex flex-wrap gap-2">
        {COMMON_VALUES.map((num) => (
          <Button
            key={num}
            type="button"
            variant={value === num ? "default" : "outline"}
            onClick={() => onChange(num)}
            className="w-10 px-0"
          >
            {num}
          </Button>
        ))}
      </div>

      {/* --- 2. Slider --- */}
      {/* <div className="space-y-2">
        <Slider
          value={[value]}
          min={MIN}
          max={MAX}
          step={1}
          onValueChange={(val) => onChange(val[0])}
        />
        <p className="text-center text-muted-foreground text-sm">
          Selected: <span className="font-semibold">{value}</span>
        </p>
      </div> */}

      {/* --- 3. Stepper Buttons --- */}
      {/* <div className="flex items-center gap-3 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= MIN}
        >
          –
        </Button>
        <span className="text-xl font-bold w-6 text-center">{value}</span>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX}
        >
          +
        </Button>
      </div> */}
    </div>
  );
}
