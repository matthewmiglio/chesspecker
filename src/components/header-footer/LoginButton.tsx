"use client";

import { signIn, signOut, useSession } from "next-auth/react";

interface LoginButtonProps {
  loginText?: string;
  showLogout?: boolean;
}

export default function LoginButton({
  loginText = "Login",
  showLogout = true,
}: LoginButtonProps) {
  const { data: session } = useSession();

  // Always use dark mode styling
  const buttonClasses = "bg-white text-black";

  // Display name: email prefix (before @) or "User"
  const emailPrefix = session?.user?.email?.split('@')[0];
  const displayName = emailPrefix || "User";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {session ? (
        <>
          <span className="text-foreground">
            Welcome {displayName}
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
