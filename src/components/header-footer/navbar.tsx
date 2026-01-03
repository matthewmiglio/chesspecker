"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";
import { Menu, X, Home, Puzzle, Plus, BarChart3, Info, MessageSquare, Heart, Crown } from "lucide-react";
import LoginStreakDisplay from "./LoginStreakDisplay";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Practice", href: "/puzzles", icon: Puzzle },
    { name: "Create", href: "/create", icon: Plus },
    { name: "Performance", href: "/dashboard", icon: BarChart3 },
    { name: "Premium", href: "/pricing", icon: Crown },
    { name: "About", href: "/about", icon: Info },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Donate", href: "/donate", icon: Heart },
  ];

  return (
    <>
      {/* Desktop Sidebar - Rolls-Royce Inspired */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 h-screen w-72 z-50 flex-col py-12 px-8 border-r"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
          borderColor: 'rgba(255,255,255,0.05)'
        }}
      >
        {/* Logo */}
        <Link href="/puzzles" className="mb-16">
          <h1 className="text-3xl tracking-[0.05em]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <span className="text-white font-light">Chess</span>
            <span className="text-red-400 font-normal">Pecker</span>
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-red-400/50 to-transparent mt-4" />
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 flex-1">
          {navLinks.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="group relative px-4 py-4 flex items-center gap-4 rounded-sm transition-all duration-700"
                style={{
                  background: isActive ? 'rgba(239,68,68,0.05)' : 'transparent'
                }}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-700 group-hover:scale-110"
                  style={{
                    color: isActive ? '#fca5a5' : '#525252',
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(239,68,68,0.3))' : 'none'
                  }}
                  strokeWidth={1.5}
                />
                <span
                  className="text-sm tracking-[0.1em] transition-all duration-700"
                  style={{
                    color: isActive ? '#fafafa' : '#737373',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isActive ? 400 : 300,
                    textShadow: isActive ? '0 0 20px rgba(239,68,68,0.2)' : 'none'
                  }}
                >
                  {name}
                </span>
                {/* Glow effect on active */}
                {isActive && (
                  <span
                    className="absolute right-4 w-2 h-2 rounded-full bg-red-400"
                    style={{ boxShadow: '0 0 12px rgba(239,68,68,0.6)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t flex flex-col gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <LoginStreakDisplay />
          <LoginButton />
        </div>
      </nav>

      {/* Mobile Top Navbar - Rolls-Royce Inspired */}
      <nav
        className="lg:hidden sticky top-0 z-50"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/puzzles" className="py-2">
            <h1 className="text-2xl tracking-[0.05em]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <span className="text-white font-light">Chess</span>
              <span className="text-red-400 font-normal">Pecker</span>
            </h1>
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-md"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(180deg, #0f0f0f 0%, #111111 100%)',
            borderTop: isMenuOpen ? '1px solid rgba(255,255,255,0.05)' : 'none'
          }}
        >
          <div className="px-5 py-4 flex flex-col gap-1">
            {navLinks.map(({ name, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="group relative px-4 py-3 flex items-center gap-4 rounded-sm transition-all duration-500"
                  style={{
                    background: isActive ? 'rgba(239,68,68,0.05)' : 'transparent'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon
                    className="w-5 h-5 transition-all duration-500"
                    style={{
                      color: isActive ? '#fca5a5' : '#525252',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(239,68,68,0.3))' : 'none'
                    }}
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-sm tracking-[0.08em] transition-all duration-500"
                    style={{
                      color: isActive ? '#fafafa' : '#737373',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: isActive ? 400 : 300
                    }}
                  >
                    {name}
                  </span>
                  {/* Glow indicator */}
                  {isActive && (
                    <span
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-red-400"
                      style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Streak display (mobile) */}
            <div className="mt-4 px-4">
              <LoginStreakDisplay />
            </div>

            <div className="mt-4 pt-4 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
