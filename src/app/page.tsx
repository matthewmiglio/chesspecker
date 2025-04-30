"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/chess_duel_white.png"
      : "/heros/chess_duel_black.png";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-0 relative overflow-hidden">
      {/*debug card object */}
      <div className="p-4">
              <Card className="bg-card bg-[#222] text-white border border-red-500">
                <div>🧪 Debug Card</div>
                <div>CSS var value:</div>
                <pre className="text-xs whitespace-pre-wrap break-words px-2">
                  {typeof window !== "undefined" &&
                    getComputedStyle(document.documentElement).getPropertyValue("--card")}
                </pre>
              </Card>
            </div>

            {/*debug card object */}
            <div className="p-4">
              <div className="bg-red-500 text-white border border-blue-500 p-4 min-h-[100px] min-w-[100px]">
                🧪 Mobile Test Card
                <br />
                If you can see this on mobile, layout is fine.
              </div>
            </div>



      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center max-w-3xl space-y-6">
        <div className="relative w-85 h-85 md:w-132 md:h-132 transition-transform">
          <Image
            src={heroImage}
            alt="Chess Thinker Hero"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Train Smarter. Play Better.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl px-4">
          Build your own tactical puzzles, master key positions, and track your
          progress across every session.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg">
            <Link href="/puzzles">Start Training</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      {/* FEATURE STRIP */}
      <section className="mt-24 w-full max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        {[
          {
            title: "Create Puzzle Sets",
            desc: "Tailor puzzles by theme, rating, opening, and more.",
            icon: "♟️",
          },
          {
            title: "Interactive Solving",
            desc: "Play puzzles on a real board with smart feedback.",
            icon: "🎯",
          },
          {
            title: "Track & Improve",
            desc: "See your accuracy, solve time, and improvement.",
            icon: "📈",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center bg-card p-6 rounded-xl shadow-md border border-border w-full"
          >
            <div className="text-4xl mb-2">{f.icon}</div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
