"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AboutStructuredData from "@/components/structured-data/AboutStructuredData";
import { Heart } from "lucide-react";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [image1Loaded, setImage1Loaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  const [image3Loaded, setImage3Loaded] = useState(false);
  const [image4Loaded, setImage4Loaded] = useState(false);
  const [image5Loaded, setImage5Loaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;


  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
      <AboutStructuredData />


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* Hero Image - Elite Chess Match */}
        <div className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/misc/php0qqLXE.jpg"
            alt="Elite chess match - Gukesh vs Magnus Carlsen"
            fill
            style={{ objectFit: "cover" }}
            className={`transition-opacity duration-1000 ease-in-out ${
              image1Loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImage1Loaded(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </div>

        {/* What is ChessPecker Section */}
        <section className="space-y-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                What is ChessPecker?
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            <div className="space-y-8">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                ChessPecker is a tactical training platform that implements the
                <span className="text-foreground font-semibold"> Woodpecker Method</span> —
                an intensive repetition system designed to transform your pattern recognition.
                Unlike random puzzle apps, ChessPecker gives you carefully curated sets
                that you solve in <span className="text-foreground font-semibold">multiple cycles</span>,
                each time faster and with greater accuracy.
              </p>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                <span className="text-foreground font-semibold">Smart curation</span> means puzzles matched to your skill level, not random selections.
                <span className="text-foreground font-semibold"> Cycle training</span> lets you re-solve the same sets for pattern mastery, building neural pathways
                that make tactical recognition automatic. <span className="text-foreground font-semibold">Progress tracking</span> provides detailed analytics to see your improvement,
                including accuracy trends, speed improvements, and weak pattern identification across each training cycle.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Section with Magnus Image */}
        <section className="space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image
                src="/misc/67e6ad8f236b59cdbb74c8f87008baec504510e4.webp"
                alt="Magnus Carlsen in deep thought"
                fill
                style={{ objectFit: "cover", objectPosition: "center 20%" }}
                className={`transition-opacity duration-1000 ease-in-out ${
                  image2Loaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImage2Loaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>

            <div className="space-y-8 order-1 md:order-2">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground text-left">
                  The Philosophy
                </h3>
                <div className="w-16 h-px bg-gradient-to-r from-primary to-transparent" />
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                Every feature, every algorithm, every piece of the training system is built around one simple idea:
                <span className="text-foreground font-semibold block mt-4"> make chess improvement as intelligent and efficient as possible</span>.
              </p>
              <p className="text-lg text-muted-foreground/80 text-left">
                No ads, no fluff — just effective training tools for chess players who want to improve.
              </p>
            </div>
          </div>
        </section>

        {/* My Story Section */}
        <section className="space-y-16">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                My Story
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            <div className="space-y-12">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                I&apos;m 23, and last year something clicked. I became absolutely
                <span className="text-foreground font-semibold"> obsessed with chess</span>.
                What started as casual games quickly evolved into studying grandmaster games at 2 AM,
                analyzing positions for hours, and dreaming about tactical patterns.
              </p>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                But as I dove deeper into training, I realized most chess improvement is really a
                data problem — you need the right puzzles,
                at the right difficulty, reviewed at the right intervals. It&apos;s not just about solving
                thousands of random tactics; it&apos;s about creating a <span className="text-foreground font-semibold">systematic approach</span> where each puzzle
                builds on the last, <span className="text-foreground font-semibold">reinforcing patterns</span> until they become automatic.
              </p>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                Yet existing systems felt unintelligent.
                Random puzzles thrown at you with no context. No real progression tracking beyond simple ratings.
                No understanding of what you actually need to work on, or which specific patterns you&apos;re struggling with.
                Most platforms seemed built for engagement metrics rather than <span className="text-foreground font-semibold">actual learning efficiency</span>.
              </p>

              <div className="py-8 text-center">
                <p className="text-2xl md:text-3xl font-semibold text-primary">
                  So I decided to build something better.
                </p>
              </div>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                I started coding ChessPecker in 2024, combining my software development background
                with this newfound chess passion. There&apos;s something
                <span className="text-foreground font-semibold"> magical</span> about building exactly
                the training tool I wished existed.
              </p>
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section className="text-center space-y-12 max-w-3xl mx-auto pb-20">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Connect & Support
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
              Thanks for being part of the ChessPecker journey. Whether you want to learn more about the development
              or support the project, I&apos;d love to connect.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://www.matthewmiglio.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-lg font-medium"
            >
              <Heart className="w-5 h-5" />
              <span>Visit My Portfolio</span>
            </a>
            <a
              href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-lg font-medium"
            >
              <Heart className="w-5 h-5" />
              <span>Support ChessPecker</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}