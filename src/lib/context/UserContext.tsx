"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface ExtendedSession extends Session {
  supabase?: {
    access_token: string;
    user_id: string | null;
    expires_at: number | undefined;
  };
}

interface UserContextType {
  email: string | null;
  userId: string | null;
  accessToken: string | null;
}

const UserContext = createContext<UserContextType>({
  email: null,
  userId: null,
  accessToken: null
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession;
  const email = session?.user?.email ?? null;
  const userId = extendedSession?.supabase?.user_id ?? null;
  const accessToken = extendedSession?.supabase?.access_token ?? null;

  return (
    <UserContext.Provider value={{ email, userId, accessToken }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
