"use client";

import { useState } from "react";
import Image from "next/image";

export function PhilosophySection() {
  const [image2Loaded, setImage2Loaded] = useState(false);

  return (
    <section className="space-y-16">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
          <Image
            src="/misc/Harry-Benson-Bobby-Fischer-Buenos-Aires.jpg"
            alt="Bobby Fischer in Buenos Aires"
            fill
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
            className={`transition-opacity duration-1000 ease-in-out ${
              image2Loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImage2Loaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        <div className="space-y-8 order-1 md:order-2">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground text-left">
              The Philosophy
            </h3>
            <div className="w-16 h-px bg-gradient-to-r from-primary to-transparent" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            Every feature, every algorithm, every piece of the training system is built around one simple idea:
            <span className="text-foreground font-semibold block mt-4"> make chess improvement as efficient as possible.</span>
          </p>
          <p className="text-lg text-muted-foreground/80 text-left">
            No ads, no fluff — just effective training tools for chess players who want to improve.
          </p>
        </div>
      </div>
    </section>
  );
}
