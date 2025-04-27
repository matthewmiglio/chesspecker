"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center">
      {/* HEADER */}
      <h1 className="text-5xl font-bold mb-8">About ChessPecker</h1>

      {/* CHESS IMAGE */}
      <div className="flex justify-center mb-8">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96">
          <Image
            src="/chess-tactic-image.webp"
            alt="Chess tactic diagram"
            fill
            className="object-contain rounded-2xl shadow-lg border border-border"
            priority
          />
        </div>
      </div>

      {/* TAGLINE */}
      <p className="text-muted-foreground text-lg mb-20">
        Master tactics. Train smarter. Win faster.
      </p>

      {/* WOODPECKER METHOD */}
      <div className="text-left w-full max-w-2xl space-y-10 mb-20">
        <h2 className="text-2xl font-bold text-primary">
          What is the Woodpecker Method?
        </h2>
        <p className="text-muted-foreground">
          The{" "}
          <span className="text-foreground font-semibold">
            Woodpecker Method
          </span>{" "}
          is a focused chess training system built around intensive repetition.
        </p>

        <div className="space-y-6">
          {[
            {
              title: "Step 1",
              description:
                "Solve a carefully selected set of puzzles—again and again.",
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
          ].map((step, idx) => (
            <div key={idx}>
              <h3 className="text-primary font-semibold mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QUOTE + CTA */}
      <div className="w-full max-w-2xl text-center space-y-10">
        <h2 className="text-2xl font-bold text-foreground">
          Start mastering yours today.
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Build your first puzzle set and experience training that actually
          sharpens your instincts.
        </p>

        <Link
          href="/puzzles"
          className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Get Started
        </Link>
      </div>

      {/* FOOTER */}
      <div className="mt-20 text-center text-sm text-muted-foreground">
        Built by a solo dev who loves chess—and hates fluff.
      </div>
    </div>
  );
}
