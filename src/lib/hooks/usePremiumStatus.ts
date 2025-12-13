import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface SubscriptionData {
  tier: "free" | "premium";
  subscription_status: string | null;
  subscription_ends_at: string | null;
}

interface PremiumStatus {
  isPremium: boolean;
  tier: "free" | "premium";
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
  refetch: () => Promise<void>;
}

export function usePremiumStatus(): PremiumStatus {
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      setData({ tier: "free", subscription_status: null, subscription_ends_at: null });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/subscription");

      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const subscriptionData: SubscriptionData = await response.json();
      setData(subscriptionData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setData({ tier: "free", subscription_status: null, subscription_ends_at: null });
    } finally {
      setIsLoading(false);
    }
  }, [sessionStatus, session?.user?.email]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }
    fetchSubscription();
  }, [sessionStatus, fetchSubscription]);

  return {
    isPremium: data?.tier === "premium",
    tier: data?.tier || "free",
    isLoading: isLoading || sessionStatus === "loading",
    error,
    subscriptionStatus: data?.subscription_status || null,
    subscriptionEndsAt: data?.subscription_ends_at
      ? new Date(data.subscription_ends_at)
      : null,
    refetch: fetchSubscription,
  };
}

// Constants for feature limits
export const FREE_TIER_LIMITS = {
  maxSets: 3,
  maxSetSize: 100,
  freeThemes: ["mateIn1", "mateIn2", "fork", "pin", "endgame"],
} as const;

export const PREMIUM_TIER_LIMITS = {
  maxSets: Infinity,
  maxSetSize: 500,
  freeThemes: null, // All themes available
} as const;

export function getTierLimits(isPremium: boolean) {
  return isPremium ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}
