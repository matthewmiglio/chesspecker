"use client";

import Link from "next/link";
import { useThemeAccentColor } from "@/lib/hooks/useThemeAccentColor";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import LoginButton from "./LoginButton";
import { Menu, X } from "lucide-react";
import LoginStreakDisplay from "./LoginStreakDisplay";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeColor = useThemeAccentColor();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Practice", href: "/puzzles" },
    { name: "Create", href: "/create" },
    { name: "Performance", href: "/dashboard" },
    { name: "About", href: "/about" },
    { name: "Feedback", href: "/feedback" },
    { name: "Donate", href: "/donate" },
  ];


  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-50 backdrop-blur-md flex-col py-6 px-4 border-r"
        style={{
          background: "var(--background)",
          borderColor: themeColor,
          boxShadow: `2px 0 8px ${themeColor}20`,
        }}
      >
        {/* Logo */}
        <Link href="/puzzles" className="font-bold text-3xl flex items-center gap-2 mb-8 px-2">
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

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 flex-1">
          {navLinks.map(({ name, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative font-medium transition-all duration-200 px-4 py-3 rounded-lg"
                style={{
                  color: isActive ? themeColor : "var(--muted-foreground)",
                  background: isActive ? `${themeColor}15` : "transparent",
                }}
              >
                {name}
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] rounded-r-full animate-pulse"
                    style={{
                      background: themeColor,
                      boxShadow: `0 0 8px ${themeColor}`,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <LoginStreakDisplay />
          <LoginButton />
        </div>
      </nav>

      {/* Mobile Top Navbar */}
      <nav
        className="lg:hidden sticky top-0 z-50 backdrop-blur-md"
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

          {/* Mobile Toggle */}
          <div className="flex items-center gap-3">
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
            className="border-t rounded-b-lg shadow-inner backdrop-blur-md"
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
    </>
  );
}
