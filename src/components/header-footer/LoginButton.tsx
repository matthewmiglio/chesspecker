"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

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
  
  const buttonClasses = resolvedTheme === "dark" 
    ? "bg-white text-black" 
    : "bg-gray-600 text-white";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {session ? (
        <>
          {/* <span className="text-white">
            Welcome, {session.user?.name?.split(" ")[0] || "User"}
          </span> */}
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
