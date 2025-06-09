"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import FeedbackPopup from "@/components/ui/FeedbackPopup";

import { useSession } from "next-auth/react";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [themeColor, setThemeColor] = useState("var(--red-progress-color)");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => {
  const run = async () => {
    if (session?.user?.email) {
      const email = session.user.email;
      console.log("This user is logged in!");
      console.log("The email is:", email);

      // Step 1: Get login streak (use local variable to evaluate conditions immediately)
      let streak = 0;
      try {
        const res = await fetch("/api/login_streak/get_login_streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch streak");
        }

        streak = result.login_count;
        console.log("Login streak count:", streak);
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

        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch popup flags");
        }

        const feedbackSeen = result.data?.feedback;
        console.log("Feedback seen:", feedbackSeen);

        // Step 3: Decide whether to show popup
        if (feedbackSeen === true || streak < 2) {
          console.log("User has already seen the popup OR login streak too low.");
        } else {
          console.log("Show the feedback popup!");
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

  if (!isMounted) {
    return null;
  }

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/chess_duel_white.png"
      : "/heros/chess_duel_black.png";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-0 relative overflow-hidden">
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
            className="rounded-xl  transition-all duration-300"
            style={{
              boxShadow: `0 0 22px ${themeColor}`,
              // borderRadius: "1rem",
            }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-xl shadow-none  bg-white"
            >
              <Link href="/puzzles">Start Training</Link>
            </Button>
          </div>

          {/* Learn More */}
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
        {showFeedbackPopup && (
          <FeedbackPopup
            onConfirm={async () => {
                window.location.href = "/feedback";

            }}
            onDismiss={async () => {
              setShowFeedbackPopup(false); // ✅ Close popup only
            }}
          />
        )}

      </section>

    </div>
  );
}
