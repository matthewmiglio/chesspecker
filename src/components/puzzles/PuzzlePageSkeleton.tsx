"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function PuzzlePageLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
      <Card>
        <CardContent className="space-y-6">
          <div className="h-[360px] w-full bg-muted rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="h-10 w-32 bg-muted rounded" />
        </CardFooter>
      </Card>

      <div className="sm:mt-10 mt-0 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-muted rounded-lg shadow-inner" />
        ))}
      </div>
    </div>
  );
}
