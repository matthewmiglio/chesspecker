"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NoDataCardProps = {
  hasInsufficientRepeats?: boolean;
  noSets?: boolean;
};

export default function NoDataCard({ hasInsufficientRepeats = false, noSets = false }: NoDataCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine content based on the scenario
  const content = noSets
    ? {
        heading: "No Accuracy Data Yet",
        subheading:
          "You haven't completed any puzzle sets yet. Check back later after you've completed some sets to see your accuracy data!",
        buttonText: "Start Practicing",
        buttonVariant: "default" as const,
        showDashedBorder: false,
        heroImage: "/heros/table_study_white.png",
      }
    : hasInsufficientRepeats
    ? {
        heading: "Complete More Repeats to Track Progress",
        subheading:
          "Finish at least 2 complete repeats of this puzzle set to unlock your progress charts and track your improvement over time.",
        buttonText: "Continue Practicing",
        buttonVariant: "default" as const,
        showDashedBorder: true,
        heroImage: "/heros/chess-boy-white.png",
      }
    : {
        heading: "No Accuracy Data Yet",
        subheading: "There's no data yet. Start solving to track your progress!",
        buttonText: "Start Practicing",
        buttonVariant: "outline" as const,
        showDashedBorder: false,
        heroImage: "/heros/chess-boy-white.png",
      };

  const ContentWrapper = content.showDashedBorder ? Card : "div";
  const InnerWrapper = content.showDashedBorder ? CardContent : "div";

  return (
    <ContentWrapper
      className={
        content.showDashedBorder
          ? "border-2 border-dashed border-muted-foreground/30"
          : ""
      }
    >
      <InnerWrapper className="flex flex-col items-center justify-center text-center px-4 py-12">
        {/* Hero Image */}
        <div className={`relative mb-8 ${content.showDashedBorder ? "w-48 h-48 md:w-64 md:h-64" : "w-72 h-72 md:w-96 md:h-96"}`}>
          <Image
            src={content.heroImage}
            alt="Chess Hero"
            fill
            style={{ objectFit: "contain" }}
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className={`rounded-xl transition-opacity duration-700 ease-in-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          {content.heading}
        </h2>

        {/* Subheading */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-8">
          {content.subheading}
        </p>

        {/* CTA Button */}
        <Button asChild size="lg" variant={content.buttonVariant}>
          <Link href="/puzzles">{content.buttonText}</Link>
        </Button>
      </InnerWrapper>
    </ContentWrapper>
  );
}
