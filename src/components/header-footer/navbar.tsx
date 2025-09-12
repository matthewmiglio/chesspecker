"use client";

import Link from "next/link";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import LoginButton from "./LoginButton";
import { Menu, X } from "lucide-react";
import LoginStreakDisplay from "./LoginStreakDisplay";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeColor = useThemeAccentColor();
  const pathname = usePathname();

  const navLinks = [
    { name: "Practice", href: "/puzzles" },
    { name: "Create", href: "/create" },
    { name: "Performance", href: "/dashboard" },
    { name: "About", href: "/about" },
    { name: "Feedback", href: "/feedback" },
  ];


  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "var(--background)",
        borderColor: themeColor,
        boxShadow: "var(--navbar-glow)",
      }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/puzzles" className="font-bold text-2xl flex items-center gap-2">
          <span
            style={{
              color: themeColor,
              textShadow: `0 0 6px ${themeColor}`,
            }}
          >
            Chess
          </span>
          <span style={{ color: "var(--primary)" }}>Pecker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="sm:px-4 hidden sm:flex items-center gap-6">
          {navLinks.map(({ name, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative font-medium transition-all duration-200"
                style={{
                  color: isActive ? themeColor : "var(--muted-foreground)",
                }}
              >
                {name}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 h-[2px] w-full animate-pulse rounded-full"
                    style={{
                      background: themeColor,
                      boxShadow: `0 0 4px ${themeColor}`,
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Streak display */}
          <LoginStreakDisplay />

          <LoginButton />
          <ModeToggle />
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 sm:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="sm:hidden border-t rounded-b-lg shadow-inner backdrop-blur-md"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderColor: themeColor,
          }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-y-4 text-base">
            {navLinks.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded-md font-medium transition-colors"
                style={{
                  color:
                    pathname === href ? themeColor : "var(--muted-foreground)",
                  background:
                    pathname === href ? "var(--muted)" : "transparent",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {name}
              </Link>
            ))}

            {/* Streak display (mobile) */}
            <div className="mt-2 self-start pl-3">
              <LoginStreakDisplay />
            </div>

            <div
              className="pt-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <LoginButton />
            </div>
          </div>
        </div>

      )}
    </nav>
  );
}
