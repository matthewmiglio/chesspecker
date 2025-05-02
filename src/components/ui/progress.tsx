"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  barClassName?: string
}

function Progress({ className, value, barClassName, style, ...props }: ProgressProps) {

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all",
          barClassName
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...style,
        }}

      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
