"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackCTA({ className }: { className?: string }) {
  return (
    <div className={cn("my-8 px-4 max-w-3xl mx-auto", className)}>
      <div className="bg-black border border-zinc-800 p-6 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
              // FEEDBACK_REQUEST
            </p>
            <h3 className="text-zinc-200 text-sm uppercase tracking-wider">
              Help us improve ChessPecker
            </h3>
            <p className="text-zinc-600 text-xs">
              {">"} Have ideas, found a bug, or want a feature? I read every message.
            </p>
          </div>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-950 transition-all text-xs uppercase tracking-wider"
          >
            <span>Give Feedback</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
