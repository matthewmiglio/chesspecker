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
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">Support the Mission</p>
          <h2 className="text-4xl font-serif italic text-white mb-6">
            Care to contribute?
          </h2>
          <div className="w-16 h-px bg-neutral-700 mx-auto mb-6"></div>
          <p className="text-neutral-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Every contribution sustains free chess training for thousands. No advertisements. No subscriptions. Pure training.
          </p>
          <a
            href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-white text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-all duration-500"
          >
            Donate via Stripe
          </a>
        </div>

      </div>
    </div>
  );
}