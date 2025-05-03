"use client";

import type React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type SetSizeInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function SetSizeInput({
  value,
  onChange,
  min = 1,
  max = 200,
}: SetSizeInputProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">Set Size</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(val) => onChange(val[0])}
      />
      <p className="text-sm text-center text-muted-foreground mt-1">
        {value} puzzles
      </p>
    </div>
  );
}
