"use client";

import { useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const force = searchParams.get("force");

  useEffect(() => {
    async function handleSignIn() {
      if (force === "true") {

        // Immediately trigger Google OAuth with force refresh
        await signIn("google", {
          callbackUrl: "/admin",
          redirect: true,
        });
      } else {
        // Normal sign in
        await signIn("google", {
          callbackUrl: "/admin",
          redirect: true,
        });
      }
    }

    handleSignIn();
  }, [force]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
      <p className="text-muted-foreground">
          {force === "true"
            ? "Performing fresh authentication to enable all features..."
            : "Redirecting to Google sign in..."
          }
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Preparing sign in...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}