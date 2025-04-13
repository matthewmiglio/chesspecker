"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import LoginButton from "./LoginButton";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl flex items-center gap-2">
          <span className="text-primary">Chess</span>
          <span>Pecker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="md:px-4 hidden md:flex items-center gap-6">
          <Link
            href="/puzzles"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Puzzles
          </Link>
          <Link
            href="/create"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Create Set
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>

          <LoginButton />

          <ModeToggle />
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-4 md:hidden">
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

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/puzzles"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Puzzles
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Set
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <LoginButton />
          </div>
        </div>
      )}
    </nav>
  );
}
