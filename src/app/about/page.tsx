"use client";

import { useEffect, useState } from "react";
import AboutStructuredData from "@/components/structured-data/AboutStructuredData";
import { HeroImage } from "@/components/about_page/HeroImage";
import { WhatIsChessPeckerSection } from "@/components/about_page/WhatIsChessPeckerSection";
import { PhilosophySection } from "@/components/about_page/PhilosophySection";
import { MyStorySection } from "@/components/about_page/MyStorySection";
import { ConnectSection } from "@/components/about_page/ConnectSection";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
      <AboutStructuredData />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* Hero Image - Elite Chess Match */}
        <HeroImage />

        {/* What is ChessPecker Section */}
        <WhatIsChessPeckerSection />

        {/* Philosophy Section with Bobby Fischer Image */}
        <PhilosophySection />

        {/* My Story Section */}
        <MyStorySection />

        {/* Connect Section */}
        <ConnectSection />
      </div>
    </div>
  );
}