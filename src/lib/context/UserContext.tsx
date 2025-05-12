"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext<{ email: string | null }>({ email: null });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? null;

  return (
    <UserContext.Provider value={{ email }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
