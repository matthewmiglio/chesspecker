"use client";

import { useState } from "react";
import Image from "next/image";

export function HeroImage() {
  const [image1Loaded, setImage1Loaded] = useState(false);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl">
      <Image
        src="/misc/php0qqLXE.jpg"
        alt="Elite chess match - Gukesh vs Magnus Carlsen"
        fill
        style={{ objectFit: "cover" }}
        className={`transition-opacity duration-1000 ease-in-out ${
          image1Loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImage1Loaded(true)}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
    </div>
  );
}
