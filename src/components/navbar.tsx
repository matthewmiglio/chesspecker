"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import LoginButton from "./LoginButton";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("user_id");
    if (!id) return;

    const fetchEmail = async () => {
      try {
        const res = await fetch("/api/getUsers");
        const users = await res.json();
        const user = users.find((u: any) => u.user_id.toString() === id);
        if (user) setUserEmail(user.email);
      } catch (err) {
        console.error("Failed to fetch user email", err);
      }
    };

    fetchEmail();
  }, []);

  const isLoggedIn = !!userEmail;

  const handleLogout = () => {
    sessionStorage.removeItem("user_id");
    location.reload();
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl flex items-center gap-2">
          <span className="text-primary">Chess</span>
          <span>Pecker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
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

          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm text-muted-foreground">
                Welcome {userEmail}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
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

            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <span>Welcome {userEmail}</span>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
