"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoDataCard() {
  // Always use dark mode image
  const heroImage = "/heros/chess-boy-white.png";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12">
      {/* Hero Image */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 mb-8">
        <Image
          src={heroImage}
          alt="Chess Hero"
          fill
          style={{ objectFit: "contain" }}
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className={`rounded-xl transition-opacity duration-700 ease-in-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        No Accuracy Data Yet
      </h2>

      {/* Subheading */}
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-8">
        There&apos;s no data yet. Start solving to track your
        progress!
      </p>

      {/* CTA Button */}
      <Button asChild size="lg" variant="outline">
        <Link href="/puzzles">Start Practicing</Link>
      </Button>
    </div>
  );
}
