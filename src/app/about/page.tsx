"use client";

import Image from "next/image";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import AboutStructuredData from "@/components/structured-data/AboutStructuredData";
import { Github, Heart, Zap, Target, TrendingUp } from "lucide-react";

import ChessPeckerSteps from "@/components/about_page/ChessPeckerSteps";

export default function AboutPage() {
  const themeColor = useThemeAccentColor();
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const heroImage =
    resolvedTheme === "dark"
      ? "/heros/table_study_white.png"
      : "/heros/table_study_black.png";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AboutStructuredData />


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight animate-fade-in">
            About ChessPecker
          </h1>

          <div className="relative max-w-md mx-auto group">
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={heroImage}
                alt="Chess study position demonstrating tactical patterns and Woodpecker Method training"
                fill
                className="object-contain transform group-hover:scale-105 transition duration-700"
                priority
              />
            </div>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Sharpen your chess tactics through the power of deliberate repetition
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Our Mission
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Focused Training</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No fluff, no distractions. Just pure tactical training designed to make you a stronger player.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Pattern Recognition</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Transform your tactical vision from slow calculation to instant recognition.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Measurable Growth</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Track your progress with detailed analytics and see your improvement over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Woodpecker Method Section */}
        <section className="mb-24">
          <div className="text-center space-y-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                The Woodpecker Method
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A focused chess training system built around intensive repetition.
                Solve the same carefully curated puzzles in multiple cycles,
                each time faster and with greater accuracy.
              </p>
            </div>

            <ChessPeckerSteps themeColor={themeColor} />

            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 backdrop-blur border border-primary/10">
              <h3 className="text-2xl font-semibold mb-6">Why Repetition Works</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Active Recall</h4>
                      <p className="text-sm text-muted-foreground">Re-solving positions forces memory retrieval, hardcoding tactical patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Speed Under Pressure</h4>
                      <p className="text-sm text-muted-foreground">Each cycle targets faster recognition for real game scenarios</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Error Focusing</h4>
                      <p className="text-sm text-muted-foreground">Revisiting the same set makes your weaknesses obvious</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Automatic Recognition</h4>
                      <p className="text-sm text-muted-foreground">Move from thinking to seeing tactical patterns instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Built with Passion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ChessPecker is crafted by a solo developer who believes in the power of focused, deliberate practice. No ads, no fluff—just effective training tools for chess players who want to improve.
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <a
              href="https://www.matthewmiglio.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Heart className="w-4 h-4" />
              <span>Visit My Profile</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}