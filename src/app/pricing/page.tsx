"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { usePremiumStatus, FREE_TIER_LIMITS } from "@/lib/hooks/usePremiumStatus";
import { Check, X, Crown, Loader2 } from "lucide-react";
import PricingStructuredData from "@/components/structured-data/PricingStructuredData";

function PricingContent() {
  const { status: sessionStatus } = useSession();
  const { isPremium, isLoading: premiumLoading, refetch } = usePremiumStatus();
  const searchParams = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ type: "success", text: "Payment successful! Welcome to Premium." });
      refetch();
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment canceled. No charges were made." });
    }
  }, [searchParams, refetch]);

  // Safety check: ensure user is registered in ChessPeckerUsers table
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetch("/api/user/ensure-registered", { method: "POST" }).catch(() => {
        // Silently fail - not critical for page functionality
      });
    }
  }, [sessionStatus]);

  const handleCheckout = async () => {
    if (sessionStatus !== "authenticated") {
      setMessage({ type: "error", text: "Please sign in to upgrade" });
      return;
    }

    setIsCheckoutLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: billingPeriod === "monthly"
            ? "price_1Sdj1GRpTvYYS9hRhAcsBgEq"
            : "price_1Sdj1GRpTvYYS9hRT8Yr7QIy",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open customer portal");
      }

      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const features = [
    { name: "Puzzle sets", free: `Up to ${FREE_TIER_LIMITS.maxSets}`, premium: "Unlimited" },
    { name: "Puzzles per set", free: `Up to ${FREE_TIER_LIMITS.maxSetSize}`, premium: "Up to 500" },
    { name: "Puzzle themes", free: "5 basic themes", premium: "All 21 themes" },
    { name: "Analytics dashboard", free: true, premium: true },
    { name: "Progress tracking", free: true, premium: true },
    { name: "Board customization", free: true, premium: true },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
      <PricingStructuredData />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upgrade to <span className="text-[var(--theme-color)]">Premium</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited puzzle sets, larger set sizes, and all tactical themes to master your chess.
          </p>
        </div>

        {/* Message banner */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Already Premium */}
        {isPremium && !premiumLoading && (
          <div className="mb-12 p-6 rounded-xl bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/30 text-center">
            <Crown className="w-12 h-12 text-[var(--theme-color)] mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">You&apos;re a Premium Member!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for supporting ChessPecker. You have access to all premium features.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
              className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {isPortalLoading ? (
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
              ) : null}
              Manage Subscription
            </button>
          </div>
        )}

        {/* Billing toggle */}
        {!isPremium && (
          <div className="flex justify-center mb-12">
            <div className="bg-white/5 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-[var(--theme-color)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingPeriod === "yearly"
                    ? "bg-[var(--theme-color)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                  Save 33%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Perfect for getting started with spaced repetition chess training.
            </p>
            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  {feature.free === true ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : feature.free === false ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  <span>
                    {feature.name}
                    {typeof feature.free === "string" && (
                      <span className="text-muted-foreground ml-1">({feature.free})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <button
              disabled
              className="w-full py-3 rounded-lg bg-white/10 text-muted-foreground cursor-default"
            >
              Current Plan
            </button>
          </div>

          {/* Premium tier */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--theme-color)]/20 to-[var(--theme-color)]/5 border-2 border-[var(--theme-color)]/50">
            {billingPeriod === "monthly" && (
              <div className="bg-[var(--theme-color)] text-white text-sm px-4 py-1 rounded-full w-fit mx-auto -mt-4 mb-4">
                Recommended
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              Premium
              <Crown className="w-5 h-5 text-[var(--theme-color)]" />
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${billingPeriod === "monthly" ? "4.99" : "39.99"}
              </span>
              <span className="text-muted-foreground">
                /{billingPeriod === "monthly" ? "month" : "year"}
              </span>
              {billingPeriod === "yearly" && (
                <div className="text-sm text-muted-foreground mt-1">
                  Just $3.33/month
                </div>
              )}
            </div>
            <p className="text-muted-foreground mb-6">
              Unlimited access to supercharge your chess improvement.
            </p>
            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[var(--theme-color)]" />
                  <span>
                    {feature.name}
                    {typeof feature.premium === "string" && (
                      <span className="text-[var(--theme-color)] ml-1">({feature.premium})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {!isPremium && (
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading || sessionStatus !== "authenticated"}
                className="w-full py-3 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--theme-color)",
                  boxShadow: "0 4px 14px 0 rgba(0, 200, 150, 0.3)"
                }}
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : sessionStatus !== "authenticated" ? (
                  "Sign in to Upgrade"
                ) : (
                  `Upgrade to Premium`
                )}
              </button>
            )}
            {isPremium && (
              <button
                disabled
                className="w-full py-3 rounded-lg bg-[var(--theme-color)]/50 text-white cursor-default"
              >
                Current Plan
              </button>
            )}
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-muted-foreground">
            Contact us at{" "}
            <a
              href="mailto:matmigg0804@gmail.com"
              className="text-[var(--theme-color)] hover:underline"
            >
              matmigg0804@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  );
}
