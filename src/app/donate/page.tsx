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
            No ads. No premium tiers.
          </p>
        </div>

        {/* Why Donations Matter Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-2">The honest truth about server costs</h2>

          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            Running ChessPecker takes real resources — from puzzle generation costs like compute and storage, to scaling the database that keeps everyone’s progress safe, plus the occasional development push to improve the platform. Every dollar donated helps thousands of players train better every day. Because we don’t run ads or premium tiers, your support is what keeps ChessPecker fast, stable, and aligned with our mission: all training, no fluff. Think of it as chipping in to keep a community tool alive and accessible to everyone.
          </p>

          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            Small contributions go a long way. One dollar can cover a month of puzzle storage. Ten dollars keeps the servers running for a week. Twenty-five dollars offsets a big portion of the monthly hosting bill. Your support not only keeps the lights on but also ensures we can keep listening to feedback and evolving the site in ways that match your training needs.
          </p>

         
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