"use client";

import { useEffect, useState } from "react";

export default function DonatePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-8 py-24">

        {/* Page Title Section */}
        <div className="text-center mb-24">
          <h1 className="text-5xl font-bold mb-6">
            Support ChessPecker
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            No ads. No premium tiers. Just a broke student building something for chess nerds.
          </p>
        </div>

        {/* Why Donations Matter Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8">The honest truth about server costs</h2>

          <p className="text-lg mb-6 leading-relaxed">
            Running ChessPecker costs me about $40-60 every month. That includes hosting the website,
            paying for the domain, processing thousands of chess puzzles, and maintaining the database
            that stores all your progress and puzzle data. As a broke student, those bills add up fast.
          </p>

          <p className="text-lg mb-8 leading-relaxed">
            Donations help me keep this running without constantly stressing about whether I can afford
            next month's expenses.
          </p>

          <div className="space-y-4 text-lg">
            <p>A $5 donation helps me cover groceries for the week</p>
            <p>A $20 donation helps me cover next month's hosting bill</p>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">So... wanna chip in?</h2>

          <p className="text-lg mb-8 leading-relaxed">
            Every dollar helps keep this alive. No ads, no BS, just useful chess training.
          </p>

          <a
            href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Donate via Stripe 💸
          </a>
        </div>

      </div>
    </div>
  );
}