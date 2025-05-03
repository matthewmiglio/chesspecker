"use client";

import type React from "react";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    </div>
  );
}
