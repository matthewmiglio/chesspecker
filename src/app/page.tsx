"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import FeedbackPopup from "@/components/ui/FeedbackPopup";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import HomeStructuredData from "@/components/structured-data/HomeStructuredData";

/* ---------- Testimonials Data ---------- */
type Testimonial = {
  name: string;
  monthYear: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  // 🔝 Strong / Marketable
  { name: "Ahmed", monthYear: "September 2025", quote: "I love this site—it helped me go from about 100 Elo to 500. Thank you!" },
  { name: "Emilio", monthYear: "September 2025", quote: "I started playing chess July 1 this year and I've been looking for ways to improve. I'm loving this method so much… I hope it can become an Android app — I'd even pay for it. Greetings from Mexico!" },
  { name: "Roman", monthYear: "October 2025", quote: "I've used ChessPecker for about three months—it's become a crucial part of my training. Really appreciate the touch-to-move update." },
  { name: "Jordan", monthYear: "September 2025", quote: "Overall, I love the platform—I've made immense improvements this month." },
  { name: "Emilio", monthYear: "September 2025", quote: "Finished my first 8-lap set of 100. First try took around 4 hours with ~40% accuracy. My 8th round was 99% in around 14 minutes :D" },
  { name: "Dmitry", monthYear: "September 2025", quote: "I was looking for a way to do Woodpecker training—this tool is amazing." },
  { name: "Vaishnav", monthYear: "August 2025", quote: "ChessPecker is great — it offers free training and is excellent for tactics using the Woodpecker Method." },
  { name: "Gustavo", monthYear: "September 2025", quote: "The site really helped me grow. Thanks to anyone who had this idea." },
  { name: "Sunaksh", monthYear: "July 2025", quote: "It's the best way to train the Woodpecker Method." },

  // 👍 Solid
  { name: "FlickeryGems", monthYear: "August 2025", quote: "Great website to practice the Woodpecker Method." },
  { name: "JR", monthYear: "August 2025", quote: "Thank you for sharing this great work you've done!" },
  { name: "Adam", monthYear: "July 2025", quote: "Great work — it has a good feel to it." },
  { name: "Sam", monthYear: "June 2025", quote: "Awesome website! Thanks for your contribution — you rock!!" },
  { name: "Frogi", monthYear: "August 2025", quote: "I really like the site." },
  { name: "Viesturs", monthYear: "August 2025", quote: "Just starting, but the website looks great!" },

  // 👌 Weak / Minimal
  { name: "Roman", monthYear: "August 2025", quote: "I appreciate your work — love you, bro." },
  { name: "Anton", monthYear: "October 2025", quote: "Good for improving at chess." },
];


/* ---------- Airy, Always-Scrolling Carousel ---------- */
function TestimonialsCarousel({
  themeColor,
  autoAdvanceMs = 6000,
}: {
  themeColor: string;
  autoAdvanceMs?: number;
}) {
  const [index, setIndex] = useState(0);
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
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [themeColor, setThemeColor] = useState("var(--red-progress-color)");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { data: session, status } = useSession();

  // Keep your feedback popup logic intact
  useEffect(() => {
    const run = async () => {
      if (session?.user?.email) {
        const email = session.user.email;

        // Step 1: Get login streak
        let streak = 0;
        try {
          const res = await fetch("/api/login_streak/get_login_streak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Failed to fetch streak");
          streak = result.login_count;
        } catch (err) {
          console.error("Error fetching login streak:", err);
        }

        // Step 2: Get popup flag
        try {
          const res = await fetch("/api/popup_flags/getFlag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Failed to fetch popup flags");

          const feedbackSeen = result.data?.feedback;

          // Step 3: Decide whether to show popup
          if (feedbackSeen !== true && streak >= 2) {
            setShowFeedbackPopup(true);
          }
        } catch (err) {
          console.error("Error checking feedback flag:", err);
        }
      }
    };

    run();
  }, [status, session]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setThemeColor(
      resolvedTheme === "dark"
        ? "var(--red-progress-color)"
        : "var(--blue-progress-color)"
    );
  }, [resolvedTheme]);

  if (!isMounted) return null;

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/chess_duel_white.png"
      : "/heros/chess_duel_black.png";

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
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Train Smarter. <span style={{ color: themeColor }}>Play Better.</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl px-4">
          Build your own tactical puzzles, master key positions, and track your
          progress across every session.
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

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <FeedbackPopup
          onConfirm={async () => { window.location.href = "/feedback"; }}
          onDismiss={async () => { setShowFeedbackPopup(false); }}
        />
      )}
    </div>
  );
}
