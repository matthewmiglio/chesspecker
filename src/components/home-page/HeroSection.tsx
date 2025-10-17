"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection({ themeColor }: { themeColor: string }) {
  const heroImage = "/heros/chess_duel_white.png";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center text-center max-w-[55rem] space-y-6">
      <div className="relative w-68 h-68 md:w-106 md:h-106 transition-transform">
        <Image
          src={heroImage}
          alt="Chess tactics training with ChessPecker - Woodpecker Method for pattern recognition"
          fill
          style={{ objectFit: "contain" }}
          priority
          className={`transition-opacity duration-700 ease-in-out ${imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold ">
        Chess Tactics Training with the <span style={{ color: themeColor }}>Woodpecker Method</span>
      </h1>

      <p className="text-muted-foreground text-lg md:text-xl px-4 font-semibold">
        Train Smarter. Play Better.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {/* Start Training (glow wrap) */}
        <div
          className="rounded-xl transition-all duration-300"
          style={{ boxShadow: `0 0 22px ${themeColor}` }}
        >
          <Button asChild size="lg" className="rounded-xl shadow-none bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/puzzles">Start Training</Link>
          </Button>
        </div>

        {/* Learn More */}
        <Button asChild variant="outline" size="lg">
          <Link href="/about">Learn More</Link>
        </Button>
      </div>
    </div>
  );
}
