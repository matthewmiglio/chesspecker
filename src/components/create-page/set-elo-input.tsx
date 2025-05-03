"use client";

import type React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type EloTargetInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function EloTargetInput({ value, onChange }: EloTargetInputProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">ELO Target</Label>
      <div className="relative">
        <Slider
          value={[value]}
          min={500}
          max={2900}
          step={50}
          onValueChange={(val) => onChange(val[0])}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground px-1 pt-1">
        <span>700</span>
        <span>1400</span>
        <span>2000</span>
        <span>2700</span>
      </div>

      <p className="text-sm text-center text-muted-foreground mt-1">
        Targeting: <span className="font-semibold">{value} ELO</span>
      </p>
    </div>
  );
}
