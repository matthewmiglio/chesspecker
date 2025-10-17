"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "./testimonials-data";

/* ---------- Airy, Always-Scrolling Carousel ---------- */
export function TestimonialsCarousel({
  themeColor,
  autoAdvanceMs = 6000,
}: {
  themeColor: string;
  autoAdvanceMs?: number;
}) {
  // Start at 0 for SSR, then randomize on mount to avoid hydration mismatch
  const [index, setIndex] = useState(0);
  const size = TESTIMONIALS.length;
  const timerRef = useRef<number | null>(null);

  // Randomize starting index after mount (client-side only)
  useEffect(() => {
    setIndex(Math.floor(Math.random() * TESTIMONIALS.length));
  }, []);

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
        <div className="relative h-[315px] md:h-[345px]">
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
                    &ldquo;{t.quote}&rdquo;
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
