"use client";

import Image from "next/image";
import CreateSetButton from "@/components/puzzles/create-set-button";
import NotLoggedInButton from "@/components/puzzles/not-logged-in-button";
import NoSetSelectedButton from "@/components/puzzles/no-set-selected-button";

type PuzzleEmptyStateProps = {
  heroImage: string;
  userSetsLength: number;
  userIsLoggedIn: boolean;
  selectedSetExists: boolean;
};

export default function PuzzleEmptyState({
  heroImage,
  userSetsLength,
  userIsLoggedIn,
  selectedSetExists,
}: PuzzleEmptyStateProps) {
  return (
    <div className="mx-auto flex items-center justify-center h-full min-h-[400px] border bg-muted/20">
      <div className="text-center p-8">
        {userSetsLength === 0 && userIsLoggedIn && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-72 h-72 md:w-96 md:h-96 transition-transform group-hover:scale-105 cursor-pointer">
              <Image
                src={heroImage}
                alt="Chess Hero"
                fill
                style={{ objectFit: "contain" }}
                priority
                className="rounded-xl"
              />
            </div>
            <div className="text-muted-foreground text-lg tracking-wide animate-fade-in">
              Ready to sharpen your instincts?
            </div>
            <CreateSetButton />
          </div>
        )}

        {!userIsLoggedIn && <NotLoggedInButton />}

        {userIsLoggedIn && !selectedSetExists && userSetsLength !== 0 && (
          <NoSetSelectedButton />
        )}
      </div>
    </div>
  );
}
