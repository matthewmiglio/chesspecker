"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Loader2 } from "lucide-react";
import Image from "next/image";

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  puzzles_completed: number;
  is_premium: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?limit=100");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch leaderboard");
        }

        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Styles for top 3 with chess piece images
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          color: "#FFD700",
          shadow: "0 0 20px rgba(255, 215, 0, 0.6)",
          bg: "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)",
          border: "rgba(255, 215, 0, 0.3)",
          label: "1st",
          icon: "/leadboard_icons/king.png",
        };
      case 2:
        return {
          color: "#C0C0C0",
          shadow: "0 0 16px rgba(192, 192, 192, 0.5)",
          bg: "linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(192, 192, 192, 0.04) 100%)",
          border: "rgba(192, 192, 192, 0.25)",
          label: "2nd",
          icon: "/leadboard_icons/queen.png",
        };
      case 3:
        return {
          color: "#CD7F32",
          shadow: "0 0 14px rgba(205, 127, 50, 0.5)",
          bg: "linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(205, 127, 50, 0.04) 100%)",
          border: "rgba(205, 127, 50, 0.25)",
          label: "3rd",
          icon: "/leadboard_icons/knight.png",
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <Trophy className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1
                className="text-3xl text-white font-light tracking-wide"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Leaderboard
              </h1>
              <p className="text-neutral-500 text-sm mt-1">Top puzzle solvers</p>
            </div>
          </div>
          <div className="w-24 h-px bg-gradient-to-r from-red-400/50 to-transparent" />
        </div>

        {/* Leaderboard Table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-[60px_1fr_70px] sm:grid-cols-[90px_1fr_100px] px-3 sm:px-6 py-3 sm:py-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <span className="text-neutral-500 text-xs sm:text-sm font-medium">Rank</span>
            <span className="text-neutral-500 text-xs sm:text-sm font-medium">Player</span>
            <span className="text-neutral-500 text-xs sm:text-sm font-medium text-right">Puzzles</span>
          </div>

          {/* Table Body */}
          {leaderboard.length === 0 ? (
            <div className="px-6 py-12 text-center text-neutral-500">
              No players on the leaderboard yet. Be the first!
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {leaderboard.map((entry) => {
                const rankStyle = getRankStyle(entry.rank);
                const isAnonymous = entry.display_name === "Anonymous";
                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-[60px_1fr_70px] sm:grid-cols-[90px_1fr_100px] px-3 sm:px-6 items-center transition-colors ${
                      isTopThree ? "py-3 sm:py-5" : "py-2 sm:py-4 hover:bg-white/[0.02]"
                    }`}
                    style={
                      rankStyle
                        ? {
                            background: rankStyle.bg,
                            borderLeft: `3px solid ${rankStyle.border}`,
                          }
                        : {}
                    }
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {rankStyle ? (
                        <>
                          <Image
                            src={rankStyle.icon}
                            alt={`${rankStyle.label} place`}
                            width={28}
                            height={28}
                            className="object-contain -ml-2 w-5 h-5 sm:w-7 sm:h-7"
                            style={{
                              filter: `drop-shadow(${rankStyle.shadow})`,
                            }}
                          />
                          <span
                            className="text-sm sm:text-lg font-bold"
                            style={{ color: rankStyle.color }}
                          >
                            {rankStyle.label}
                          </span>
                        </>
                      ) : (
                        <span className="text-neutral-400 text-sm sm:text-base">{entry.rank}</span>
                      )}
                    </div>

                    {/* Player Name */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span
                        className={`${
                          isTopThree ? "text-sm sm:text-lg" : "text-xs sm:text-base"
                        } font-medium truncate ${
                          isAnonymous ? "text-neutral-500 italic" : "text-white"
                        }`}
                        style={
                          rankStyle && !isAnonymous
                            ? { textShadow: `0 0 20px ${rankStyle.color}40` }
                            : {}
                        }
                      >
                        {entry.display_name}
                      </span>
                      {entry.is_premium && (
                        <Crown
                          className={`${isTopThree ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"} text-yellow-400 fill-yellow-400 flex-shrink-0`}
                        />
                      )}
                    </div>

                    {/* Puzzles Completed */}
                    <div className="text-right">
                      <span
                        className={`font-medium ${isTopThree ? "text-sm sm:text-lg" : "text-xs sm:text-base"}`}
                        style={
                          rankStyle
                            ? { color: rankStyle.color, textShadow: rankStyle.shadow }
                            : { color: "white" }
                        }
                      >
                        {entry.puzzles_completed.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-neutral-600 text-sm mt-6 text-center">
          Set a username in your profile to appear on the leaderboard with your name.
        </p>
      </div>
    </div>
  );
}
