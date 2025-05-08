"use client";

import Image from "next/image";
import Link from "next/link";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";

export default function AboutPage() {
  const steps = [
    {
      title: "Step 1",
      description: "Solve a carefully selected set of puzzles—again and again.",
    },
    {
      title: "Step 2",
      description:
        "Shrink the time between solving cycles, sharpening your pattern recognition.",
    },
    {
      title: "Step 3",
      description:
        "Master tactical motifs to make faster, stronger decisions in real games.",
    },
  ];

  const themeColor = useThemeAccentColor();

  return (
    <div className="max-w-6xl mx-auto px-8 py-24 space-y-36">
      {/* HERO GRID */}
      <section className="grid grid-cols-2 gap-12 items-center scroll-mt-24">
        {/* IMAGE with max-width */}
        <div className="relative w-full aspect-square max-w-[400px] mx-auto">
          <Image
            src="/heros/about_hero_graphic.png"
            alt="Chess tactic diagram"
            fill
            className="object-contain rounded-2xl shadow-lg border border-border"
            priority
          />
        </div>

        {/* TITLE + TAGLINE */}
        <div className="space-y-6 pl-4">
          <h1 className="text-5xl font-bold leading-tight">
            About ChessPecker
          </h1>
          <p className="text-muted-foreground text-2xl leading-relaxed">
            Master tactics. Train smarter. Win faster.
          </p>
        </div>
      </section>

      {/* WOODPECKER METHOD */}
      <section className="space-y-20 scroll-mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary">
            What is the Woodpecker Method?
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            The{" "}
            <span className="text-foreground font-semibold">
              Woodpecker Method
            </span>{" "}
            is a focused chess training system built around intensive
            repetition.
          </p>
          <div className="h-[1px] bg-border w-16 mx-auto mt-4" />
        </div>

        {/* STEPS GRID */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-card border border-border p-6 rounded-xl shadow hover:shadow-md transition space-y-4"
            >
              <div
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-primary ring-1 ring-border"
                style={{ boxShadow: `0 0 8px ${themeColor}` }}
              >
                {idx + 1}
              </div>

              <h3 className="text-xl font-semibold text-primary">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Built by a solo dev who loves chess—and hates fluff.
      </footer>
    </div>
  );
}
