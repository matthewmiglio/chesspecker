"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "./testimonials-data";

export function TestimonialsCarousel({
  themeColor,
  autoAdvanceMs = 6000,
}: {
  themeColor: string;
  autoAdvanceMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const size = TESTIMONIALS.length;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * TESTIMONIALS.length));
  }, []);

  const go = (next: number) => {
    setIndex((prev) => (prev + next + size) % size);
  };

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % size);
    }, autoAdvanceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, autoAdvanceMs, size]);

  const visibleSlides = useMemo(() => {
    const prev = (index - 1 + size) % size;
    const curr = index;
    const next = (index + 1) % size;
    return [prev, curr, next];
  }, [index, size]);

  return (
    <section className="w-[calc(100%+3rem)] -mx-6">
      <div className="bg-zinc-900 border-l-4" style={{ borderColor: themeColor }}>
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: themeColor }}>
              // USER_FEEDBACK
            </p>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="w-11 h-11 flex items-center justify-center border border-zinc-700 hover:bg-zinc-800 transition">
                <ChevronLeft className="h-5 w-5 text-zinc-400" />
              </button>
              <button onClick={() => go(1)} className="w-11 h-11 flex items-center justify-center border border-zinc-700 hover:bg-zinc-800 transition">
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </button>
            </div>
          </div>
          <div className="relative h-[240px]">
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === index;
              if (!visibleSlides.includes(i)) return null;
              return (
                <div
                  key={`${t.name}-${i}`}
                  className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                  <p className="text-xl md:text-2xl text-zinc-200 font-mono leading-relaxed mb-8 max-w-3xl">
                    {`> "${t.quote}"`}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-grow max-w-12" style={{ backgroundColor: themeColor }} />
                    <p className="text-zinc-400 font-mono text-sm">
                      {t.name.toUpperCase()} <span className="text-zinc-600">// {t.monthYear}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`min-w-[44px] h-11 flex items-center justify-center transition-all`}
              >
                <span
                  className={`h-2 rounded-full transition-all ${i === index ? "w-8" : "w-3"}`}
                  style={{ backgroundColor: i === index ? themeColor : "#3f3f46" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
