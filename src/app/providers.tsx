// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ToastProvider } from "@/lib/context/ToastContext";
import { UserProfileProvider } from "@/lib/context/UserProfileContext";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      <UserProfileProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </UserProfileProvider>
    </SessionProvider>
  );
}
