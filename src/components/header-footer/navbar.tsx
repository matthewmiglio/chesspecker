"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import LoginButton from "./LoginButton";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Practice", href: "/puzzles" },
    { name: "Create", href: "/create" },
    { name: "Performance", href: "/dashboard" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl flex items-center gap-2">
          <span className="text-primary">Chess</span>
          <span>Pecker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="sm:px-4 hidden sm:flex items-center gap-6">
          {navLinks.map(({ name, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                pathname === href ? "text-primary" : ""
              }`}
            >
              {name}
            </Link>
          ))}

          <LoginButton />
          <ModeToggle />
        </div>

        {/* Mobile Navigation Toggle */}
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

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t bg-muted/10 backdrop-blur-md shadow-lg rounded-b-lg max-h-[90vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-y-4 text-base">
            <div className="flex flex-col gap-y-2">
              {navLinks.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-2 py-3 rounded-md transition-colors font-medium ${
                    pathname === href
                      ? "text-primary bg-muted"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {name}
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
