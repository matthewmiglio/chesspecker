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

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <>
          <span className="text-white">
            Welcome, {session.user?.name?.split(" ")[0] || "User"}
          </span>
          {session && (
            <pre className="text-white text-sm">
              {JSON.stringify(session.user, null, 2)}
            </pre>
          )}

          {showLogout && (
            <button
              onClick={() => signOut()}
              className="bg-white px-4 py-2 text-black rounded"
            >
              Logout
            </button>
          )}
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-white px-4 py-2 text-black rounded"
        >
          <span className="px-3 whitespace-nowrap">{loginText}</span>
        </button>
      )}
    </div>
  );
}
