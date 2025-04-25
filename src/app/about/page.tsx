import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* INTRO */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl font-bold">About ChessPecker</h1>

        <div className="w-32 h-32 mx-auto relative">
          <Image
            src="/logos/logo_circle.png"
            alt="ChessPecker Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          <strong className="text-foreground">ChessPecker</strong> is a
          lightweight tactical training platform built to help players sharpen
          their skills through custom puzzle sets and repeat-based mastery.
          Whether you're grinding openings or drilling game-winning tactics,
          ChessPecker is designed for serious improvement.
        </p>
      </div>

      {/* WHY SECTION */}
      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
          Why ChessPecker?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🎯",
              title: "Focused Training",
              desc: "Target exact rating ranges, puzzle themes, and positions.",
            },
            {
              icon: "🔁",
              title: "Spaced Repetition",
              desc: "Revisit the same puzzles across multiple rounds.",
            },
            {
              icon: "📈",
              title: "Track Performance",
              desc: "Monitor your accuracy and progression over time.",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              desc: "No bloated UI or clutter—just chess and results.",
            },
            {
              icon: "🧠",
              title: "Open Platform",
              desc: "No locked content. No subscriptions. Practice what matters.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-muted/10 border border-border rounded-xl p-4 flex gap-4 items-start"
            >
              <div className="text-3xl">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/* CTA Section */}
      <section className="mt-20 border-t pt-12 text-center space-y-4">
        <p className="text-xl font-semibold text-foreground">
          Built by a solo dev who loves chess—and hates fluff.
        </p>

        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          If you’d like to support the project, contribute ideas, or collab,
          reach out via{" "}
          <Link
            href="/contact"
            className="text-primary underline underline-offset-2"
          >
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
