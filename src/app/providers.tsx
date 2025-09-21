// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { Session } from "next-auth";
import { UserProvider } from "@/lib/context/UserContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { SupabaseBridge } from "@/components/SupabaseBridge";

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
      <UserProvider>
        <SupabaseBridge />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </UserProvider>
    </SessionProvider>
  );
}
