"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getPseudoname } from "@/lib/api/pseudonameApi";

interface LoginButtonProps {
  loginText?: string;
  showLogout?: boolean;
}

export default function LoginButton({
  loginText = "Login",
  showLogout = true,
}: LoginButtonProps) {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pseudoname, setPseudoname] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch pseudoname when user is authenticated
  useEffect(() => {
    if (session?.user?.email) {
      getPseudoname().then((name) => setPseudoname(name));
    } else {
      setPseudoname(null);
    }
  }, [session]);

  // Prevent hydration mismatch by using consistent styling until mounted
  const buttonClasses = mounted && resolvedTheme === "dark"
    ? "bg-white text-black"
    : "bg-gray-600 text-white";

  // Display name priority: pseudoname → "User"
  const displayName = pseudoname || "User";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {session ? (
        <>
          <span className="text-foreground">
            Welcome, {displayName}
          </span>
          {showLogout && (
            <button
              onClick={() => signOut()}
              className={`px-4 py-2 rounded ${buttonClasses}`}
            >
              Logout
            </button>
          )}
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className={`px-4 py-2 rounded ${buttonClasses}`}
        >
          <span className="px-3 whitespace-nowrap">{loginText}</span>
        </button>
      )}
    </div>
  );
}
