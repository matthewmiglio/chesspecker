"use client";

import { useEffect, useState } from "react";
import AboutStructuredData from "@/components/structured-data/AboutStructuredData";
import { Heart } from "lucide-react";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;


  return (
    <div className="min-h-screen relative overflow-hidden">
      <AboutStructuredData />


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* What is ChessPecker Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                What is ChessPecker?
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            <div className="space-y-6">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                ChessPecker is a tactical training platform that implements the
                <span className="text-foreground font-medium"> Woodpecker Method</span> —
                an intensive repetition system designed to transform your pattern recognition.
                Unlike random puzzle apps, ChessPecker gives you carefully curated sets
                that you solve in <span className="text-foreground font-medium">multiple cycles</span>,
                each time faster and with greater accuracy.
              </p>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">Smart curation</span> means puzzles matched to your skill level, not random selections.
                <span className="text-foreground font-medium"> Cycle training</span> lets you re-solve the same sets for pattern mastery, building neural pathways
                that make tactical recognition automatic. <span className="text-foreground font-medium">Progress tracking</span> provides detailed analytics to see your improvement,
                including accuracy trends, speed improvements, and weak pattern identification across each training cycle.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                The Philosophy
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every feature, every algorithm, every piece of the training system is built around one simple idea:
                <span className="text-foreground font-medium"> make chess improvement as intelligent and efficient as possible</span>.
              </p>
              <p className="text-base text-muted-foreground/80 mt-4">
                No ads, no fluff — just effective training tools for chess players who want to improve.
              </p>
            </div>
          </div>
        </section>

        {/* My Story Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                My Story
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            <div className="space-y-8">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                I&apos;m 23, and last year something clicked. I became absolutely
                <span className="text-foreground font-medium"> obsessed with chess</span>.
                What started as casual games quickly evolved into studying grandmaster games at 2 AM,
                analyzing positions for hours, and dreaming about tactical patterns.
              </p>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                But as I dove deeper into training, I realized most chess improvement is really a
                data problem — you need the right puzzles,
                at the right difficulty, reviewed at the right intervals. It&apos;s not just about solving
                thousands of random tactics; it&apos;s about creating a <span className="text-foreground font-medium">systematic approach</span> where each puzzle
                builds on the last, <span className="text-foreground font-medium">reinforcing patterns</span> until they become automatic.
              </p>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Yet existing systems felt unintelligent.
                Random puzzles thrown at you with no context. No real progression tracking beyond simple ratings.
                No understanding of what you actually need to work on, or which specific patterns you&apos;re struggling with.
                Most platforms seemed built for engagement metrics rather than <span className="text-foreground font-medium">actual learning efficiency</span>.
              </p>

              <div className="py-6">
                <p className="text-xl md:text-2xl font-medium text-primary">
                  So I decided to build something better.
                </p>
              </div>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                I started coding ChessPecker in 2024, combining my software development background
                with this newfound chess passion. There&apos;s something
                <span className="text-foreground font-medium"> magical</span> about building exactly
                the training tool I wished existed.
              </p>
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Connect & Support
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Thanks for being part of the ChessPecker journey. Whether you want to learn more about the development
              or support the project, I&apos;d love to connect.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.matthewmiglio.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Heart className="w-4 h-4" />
              <span>Visit My Portfolio</span>
            </a>
            <a
              href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Heart className="w-4 h-4" />
              <span>Support ChessPecker</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}