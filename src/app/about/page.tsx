"use client";

import Image from "next/image";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/table_study_white.png"
      : "/heros/table_study_black.png";
      
  const shadowClass = resolvedTheme === "dark" ? "shadow-lg" : "";

  return (
    <div className="max-w-6xl mx-auto px-8 mt-12 ">
      {/* TITLE + TAGLINE */}
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-12">About ChessPecker</h1>

      </div>

      {/* IMAGE with max-width */}
      <div className="relative w-full aspect-square max-w-[400px] mx-auto">
        <Image
          src={heroImage}
          alt="Chess tactic diagram"
          fill
          className={`object-contain ${shadowClass}`}
          priority
        />
      </div>

      {/* WOODPECKER METHOD */}
      <section className="mt-12 ">
        <div className="mb-8 md:mb-20 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl italic text-primary">
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
        </div>

        {/* STEPS GRID */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-10 mb-10">
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
      <footer className=" pt-6 text-center text-sm text-muted-foreground">
        Built by a solo dev who loves chess—and hates fluff.
      </footer>
    </div>
  );
}
