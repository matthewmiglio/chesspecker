"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface UserProfile {
  email: string;
  username: string | null;
  tier: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  displayName: string;
  hasUsername: boolean;
  updateUsername: (username: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data.profile);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateUsername = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update username");
        return false;
      }

      setProfile(data.profile);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error updating username:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  };

  // Display name logic: username > email prefix > "User"
  const displayName = profile?.username || profile?.email?.split("@")[0] || "User";

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        displayName,
        hasUsername: !!profile?.username,
        updateUsername,
        refetch: fetchProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
