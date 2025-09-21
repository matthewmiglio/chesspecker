"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface ExtendedSession extends Session {
  supabase?: {
    access_token: string;
    user_id: string | null;
    expires_at: number | undefined;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export function SupabaseBridge() {
  const { data: session } = useSession();

  useEffect(() => {
    const extendedSession = session as ExtendedSession;
    const supa = extendedSession?.supabase;
    if (supa?.access_token) {
      supabase.auth.setSession({
        access_token: supa.access_token,
        refresh_token: "",
      });
    }
  }, [session]);

  return null;
}