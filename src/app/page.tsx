"use client";

import HomeStructuredData from "@/components/structured-data/HomeStructuredData";
import { HeroSection } from "@/components/home-page/HeroSection";
import { TestimonialsCarousel } from "@/components/home-page/TestimonialsCarousel";

/* ---------- Page ---------- */
export default function Home() {
  // Always use dark mode styling
  const themeColor = "var(--red-progress-color)";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-0 relative overflow-hidden">
      <HomeStructuredData />
      {/* HERO SECTION */}
      <HeroSection themeColor={themeColor} />

      {/* TESTIMONIALS (airy & always scrolling) */}
      <TestimonialsCarousel themeColor={themeColor} />
    </div>
  );
}
