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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {session ? (
        <>
          {/* <span className="text-white">
            Welcome, {session.user?.name?.split(" ")[0] || "User"}
          </span> */}
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
