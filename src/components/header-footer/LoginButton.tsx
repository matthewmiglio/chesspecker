"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Crown } from "lucide-react";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

interface LoginButtonProps {
  loginText?: string;
  showLogout?: boolean;
}

export default function LoginButton({
  loginText = "Login",
  showLogout = true,
}: LoginButtonProps) {
  const { data: session } = useSession();
  const { isPremium } = usePremiumStatus();

  // Always use dark mode styling
  const buttonClasses = "bg-white text-black";

  // Display name: email prefix (before @) or "User"
  const emailPrefix = session?.user?.email?.split('@')[0];
  const displayName = emailPrefix || "User";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {session ? (
        <>
          <span className="text-foreground flex items-center gap-1.5">
            Welcome {displayName}
            <Crown
              className={`w-4 h-4 ${
                isPremium
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-orange-600 fill-orange-600"
              }`}
            />
          </span>
          {showLogout && (
            <button
              onClick={() => signOut()}
              className={`px-4 py-3 min-h-[44px] rounded ${buttonClasses}`}
            >
              Logout
            </button>
          )}
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className={`px-4 py-3 min-h-[44px] rounded ${buttonClasses}`}
        >
          <span className="px-3 whitespace-nowrap">{loginText}</span>
        </button>
      )}
    </div>
  );
}
