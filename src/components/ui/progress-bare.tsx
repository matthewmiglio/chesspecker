"use client";

import { cn } from "@/lib/utils";

interface BareProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export default function BareProgress({
  value,
  className,
  barClassName,
}: BareProgressProps) {
  return (
    <div
      className={cn(
        "relative w-full h-3 bg-muted/50 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className={cn("h-full transition-all", barClassName)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
