"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import HomeStructuredData from "@/components/structured-data/HomeStructuredData";

/* ---------- Testimonials Data ---------- */
type Testimonial = {
  name: string;
  monthYear: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sam",
    monthYear: "June 2025",
    quote: "Awesome website! Thanks for your contribution, I wanted to tell you that you rock!"
  },
  {
    name: "Adam",
    monthYear: "July 2025",
    quote: "Great work, has a good feel to it."
  },
  {
    name: "Frogi",
    monthYear: "August 2025",
    quote: "I really like the site."
  },
  {
    name: "User",
    monthYear: "August 2025",
    quote: "Thank you for sharing this great work you've done!"
  },
  {
    name: "Vaishnav Sumesh",
    monthYear: "August 2025",
    quote: "ChessPecker is great as it offers free services and it is great for training tactics using the Woodpecker Method."
  },
  {
    name: "Dmit Gordeev94",
    monthYear: "September 2025",
    quote: "I was looking for ways to do the woodpecker training and this tool is amazing, happy to find it."
  },
  {
    name: "Emilio Lopez",
    monthYear: "September 2025",
    quote: "I started playing chess July 1st of this year and I've been looking for ways to improve. I'm loving so much this method, I hope it can become an app for Android! I would even pay for it."
  },
  {
    name: "Emilio Lopez",
    monthYear: "September 2025",
    quote: "Finished my first 8 laps set of 100, first try took me around 4 hours with 40% accuracy, my 8th round was 99% in around 14 minutes!"
  },
  {
    name: "Josh",
    monthYear: "September 2025",
    quote: "Site is great. Thanks for the great learning tool!"
  },
  {
    name: "Mohmadsameer9687",
    monthYear: "September 2025",
    quote: "I love this site. It did help me get better at chess. I was 100 elo now I am 500. Thanks for creating this site and helping people get better."
  }
];


/* ---------- Airy, Always-Scrolling Carousel ---------- */
function TestimonialsCarousel({
  themeColor,
  autoAdvanceMs = 6000,
}: {
  themeColor: string;
  autoAdvanceMs?: number;
}) {
  // Start at a random testimonial on each page load
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TESTIMONIALS.length));
  const size = TESTIMONIALS.length;
  const timerRef = useRef<number | null>(null);

  const go = (next: number) => {
    setIndex((prev) => (prev + next + size) % size);
  };

  // Always auto-advance (no pause on hover)
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % size);
    }, autoAdvanceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, autoAdvanceMs, size]);

  // Render only the current and adjacent slides for smooth fades
  const visibleSlides = useMemo(() => {
    const prev = (index - 1 + size) % size;
    const curr = index;
    const next = (index + 1) % size;
    return [prev, curr, next];
  }, [index, size]);

  return (
    <section className="m-28 w-full max-w-6xl px-4">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What People Are Saying</h2>
        <div className="flex gap-3">
          <button
            aria-label="Previous testimonial"
            onClick={() => go(-1)}
            className="rounded-xl border px-3 py-3 hover:bg-muted/50 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next testimonial"
            onClick={() => go(1)}
            className="rounded-xl border px-3 py-3 hover:bg-muted/50 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border bg-card"
        style={{ boxShadow: `0 0 18px ${themeColor}` }}
      >
        {/* Airy stage */}
        <div className="relative h-[420px] md:h-[460px]">
          {TESTIMONIALS.map((t, i) => {
            const isActive = i === index;
            const shouldRender = visibleSlides.includes(i);
            if (!shouldRender) return null;

            return (
              <article
                key={`${t.name}-${t.monthYear}-${i}`}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-out
                  ${isActive ? "opacity-100" : "opacity-0"}
                `}
              >
                <div className="max-w-4xl mx-auto text-center px-6 md:px-12">
                  <Quote
                    className="mx-auto mb-8 h-10 w-10 opacity-80"
                    style={{ color: themeColor }}
                  />
                  <p className="text-2xl md:text-[28px] leading-relaxed md:leading-[2.1rem] text-foreground/90">
                    “{t.quote}”
                  </p>
                  <div className="mt-10 text-base md:text-lg">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-muted-foreground"> — {t.monthYear}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Minimal dots, widely spaced for breathing room */}
        <div className="flex items-center justify-center gap-3 px-4 py-8">
          {TESTIMONIALS.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${active ? "scale-125" : "opacity-60 hover:opacity-100"}`}
                style={{
                  backgroundColor: active ? themeColor : "var(--border)",
                  boxShadow: active ? `0 0 10px ${themeColor}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  // Always use dark mode styling
  const themeColor = "var(--red-progress-color)";
  const heroImage = "/heros/chess_duel_white.png";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-0 relative overflow-hidden">
      <HomeStructuredData />
      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center max-w-3xl space-y-6">
        <div className="relative w-85 h-85 md:w-132 md:h-132 transition-transform">
          <Image
            src={heroImage}
            alt="Chess tactics training with ChessPecker - Woodpecker Method for pattern recognition"
            fill
            style={{ objectFit: "contain" }}
            priority
            className={`transition-opacity duration-700 ease-in-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-snug md:leading-snug">
          Chess Tactics Training with the <span style={{ color: themeColor }}>Woodpecker Method</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl px-4 font-semibold">
          Train Smarter. Play Better.
        </p>

        <p className="text-muted-foreground text-base md:text-lg px-4">
          Build custom puzzle sets, master tactical patterns, and track your
          progress across every training session.
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

      {/* TESTIMONIALS (airy & always scrolling) */}
      <TestimonialsCarousel themeColor={themeColor} />
    </div>
  );
}
