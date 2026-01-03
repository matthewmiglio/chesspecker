"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection({ themeColor }: { themeColor: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="w-[calc(100%+3rem)] -mx-6">
      <div className="bg-zinc-900 border-l-4" style={{ borderColor: themeColor }}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-10 md:py-32 md:px-16 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: themeColor }}>
                // CHESS_TRAINING_SYSTEM
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">
                Woodpecker<br />Method
              </h1>
            </div>
            <div className="h-px bg-zinc-700 w-24" />
            <p className="text-zinc-400 text-sm md:text-base font-mono max-w-md">
              {">"} Train smarter. Play better.<br />
              {">"} Pattern recognition system active.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="rounded-none uppercase tracking-wider text-sm" style={{ backgroundColor: themeColor }}>
                <Link href="/puzzles">Initialize Training</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none uppercase tracking-wider text-sm border-zinc-600 text-zinc-300">
                <Link href="/about">Read Docs</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full md:w-1/2 h-56 md:h-auto md:min-h-[550px]">
            <Image
              src="/high-res/photo-1580541832626-2a7131ee809f.avif"
              alt="Chess tactics training"
              fill
              style={{ objectFit: "cover" }}
              priority
              className={`transition-opacity duration-500 ${imageLoaded ? "opacity-90" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
