"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SetFinishedGraphic() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12 animate-fadeIn">
      {/* Hero Image */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square mb-8">
        <Image
          src="/set-completed-hero-white.png"
          alt="Celebratory Chess Pieces"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
        Set Completed!
      </h1>

      {/* Subheading */}
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-8">
        You&apos;re building serious tactical power.
      </p>

      {/* CTA Button */}
      <Button asChild size="lg">
        <Link href="/create">Create Another Set</Link>
      </Button>
    </div>
  );
}
