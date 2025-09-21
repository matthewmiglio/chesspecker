"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ExtendedSession {
  needsSupabaseReauth?: boolean;
}

export function SupabaseReauthBanner() {
  const { data: session } = useSession();

  // Check if user needs to re-authenticate for Supabase
  const needsReauth = (session as ExtendedSession)?.needsSupabaseReauth;

  if (!needsReauth) {
    return null;
  }

  const handleReauth = async () => {
    console.log('[SupabaseReauthBanner] Starting complete logout and fresh login process');

    // Clear any browser storage that might cache credentials
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      console.log('[SupabaseReauthBanner] Cleared browser storage');
    }

    // Force complete logout with redirect - this should clear all NextAuth cookies
    await signOut({
      callbackUrl: "/auth/signin?force=true",
      redirect: true
    });
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Authentication Update Required
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Your session needs to be updated to access all features. Please sign out and sign back in to continue.
          </p>
          <Button
            onClick={handleReauth}
            variant="outline"
            size="sm"
            className="mt-3 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sign Out and Re-login
          </Button>
        </div>
      </div>
    </div>
  );
}