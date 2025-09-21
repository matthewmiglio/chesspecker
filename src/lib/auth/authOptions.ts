import type { NextAuthOptions, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

interface ExtendedJWT extends JWT {
  supabase?: {
    access_token: string;
    refresh_token: string;
    expires_at: number | undefined;
    user_id: string | null;
  };
}

interface ExtendedSession extends Session {
  supabase?: {
    access_token: string;
    user_id: string | null;
    expires_at: number | undefined;
  };
  needsSupabaseReauth?: boolean;
}

interface GoogleAccount extends Account {
  id_token?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      console.log('[authOptions] JWT callback triggered:', {
        hasToken: !!token,
        hasAccount: !!account,
        accountProvider: account?.provider || 'none',
        accountType: account?.type || 'none',
        tokenSub: token?.sub || 'none',
        tokenEmail: token?.email || 'none'
      });

      const extendedToken = token as ExtendedJWT;

      // Check if we already have Supabase data
      const hasExistingSupabaseData = !!extendedToken.supabase?.access_token;
      console.log('[authOptions] Existing Supabase data check:', {
        hasExistingSupabaseData,
        existingUserId: extendedToken.supabase?.user_id || 'none',
        existingTokenLength: extendedToken.supabase?.access_token?.length || 0
      });

      // Handle initial Google login (account present) OR existing session without Supabase data
      if (account?.provider === "google") {
        console.log('[authOptions] Google account detected (initial login):', {
          hasIdToken: !!(account as GoogleAccount).id_token,
          idTokenLength: (account as GoogleAccount).id_token?.length || 0,
          accountKeys: Object.keys(account)
        });

        if ((account as GoogleAccount).id_token) {
          await attemptSupabaseExchange(extendedToken, (account as GoogleAccount).id_token!);
        } else {
          console.warn('[authOptions] WARNING: Google account has no id_token');
        }
      } else if (!hasExistingSupabaseData && token?.email) {
        // Handle existing session without Supabase data - attempt recovery
        console.log('[authOptions] Existing session without Supabase data, attempting recovery for:', token.email);

        // For existing sessions, we don't have the Google ID token, so we'll need to
        // either force re-login or use a different approach
        console.log('[authOptions] No account object and no existing Supabase data - user needs to re-login for Supabase integration');
      } else if (hasExistingSupabaseData) {
        console.log('[authOptions] Using existing Supabase data from token');
      } else {
        console.log('[authOptions] No Google account, no existing Supabase data, skipping exchange');
      }

      async function attemptSupabaseExchange(token: ExtendedJWT, idToken: string) {
        console.log('[authOptions] Attempting Supabase signInWithIdToken with token length:', idToken.length);

        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: idToken,
          });

          console.log('[authOptions] Supabase signInWithIdToken result:', {
            hasError: !!error,
            errorMessage: error?.message || 'none',
            errorStatus: error?.status || 'none',
            hasData: !!data,
            hasSession: !!data?.session,
            hasUser: !!data?.user,
            sessionAccessToken: data?.session?.access_token ? 'present' : 'missing',
            sessionRefreshToken: data?.session?.refresh_token ? 'present' : 'missing',
            sessionExpiresAt: data?.session?.expires_at || 'none',
            userId: data?.user?.id || 'none',
            userEmail: data?.user?.email || 'none'
          });

          if (!error && data.session) {
            console.log('[authOptions] SUCCESS: Storing Supabase session in JWT');
            token.supabase = {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
              user_id: data.user?.id ?? null,
            };
          } else {
            console.error('[authOptions] FAILED: Supabase signInWithIdToken failed:', {
              error: error?.message,
              hasSession: !!data?.session,
              fullError: error
            });
          }
        } catch (e) {
          console.error('[authOptions] EXCEPTION during Supabase signInWithIdToken:', e);
        }
      }

      const supa = extendedToken.supabase;
      console.log('[authOptions] Token refresh check:', {
        hasSupabaseData: !!supa,
        hasAccessToken: !!supa?.access_token,
        hasRefreshToken: !!supa?.refresh_token,
        expiresAt: supa?.expires_at || 'none'
      });

      if (supa?.access_token && supa?.refresh_token && supa?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const timeToExpiry = supa.expires_at! - now;
        console.log('[authOptions] Token expiry check:', {
          now: now,
          expiresAt: supa.expires_at,
          timeToExpiry: timeToExpiry,
          needsRefresh: timeToExpiry < 60
        });

        if (timeToExpiry < 60) {
          console.log('[authOptions] Refreshing Supabase token...');
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: supa.refresh_token,
          });

          console.log('[authOptions] Token refresh result:', {
            hasError: !!error,
            errorMessage: error?.message || 'none',
            hasNewSession: !!data?.session,
            newAccessToken: data?.session?.access_token ? 'present' : 'missing'
          });

          if (!error && data.session) {
            extendedToken.supabase = {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token ?? supa.refresh_token,
              expires_at: data.session.expires_at,
              user_id: data.user?.id ?? supa.user_id,
            };
            console.log('[authOptions] Token refreshed successfully');
          } else {
            console.warn('[authOptions] Token refresh failed, removing Supabase data');
            delete extendedToken.supabase;
          }
        }
      }

      console.log('[authOptions] Final JWT state:', {
        hasSupabaseData: !!extendedToken.supabase,
        accessTokenLength: extendedToken.supabase?.access_token?.length || 0,
        userId: extendedToken.supabase?.user_id || 'none'
      });

      return token;
    },

    async session({ session, token }) {
      console.log('[authOptions] Session callback triggered');
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;
      const supa = extendedToken.supabase;

      console.log('[authOptions] Session callback data:', {
        hasTokenSupabaseData: !!supa,
        tokenSupabaseAccessToken: supa?.access_token ? 'present' : 'missing',
        tokenSupabaseUserId: supa?.user_id || 'none'
      });

      if (supa?.access_token) {
        extendedSession.supabase = {
          access_token: supa.access_token,
          user_id: supa.user_id,
          expires_at: supa.expires_at,
        };
        console.log('[authOptions] Added Supabase data to session');
      } else {
        console.log('[authOptions] No Supabase data to add to session - user may need to re-login');
        // Add a flag to indicate missing Supabase integration
        extendedSession.needsSupabaseReauth = true;
      }

      console.log('[authOptions] Final session state:', {
        hasSessionSupabaseData: !!extendedSession.supabase,
        sessionSupabaseUserId: extendedSession.supabase?.user_id || 'none',
        needsReauth: extendedSession.needsSupabaseReauth || false
      });

      return extendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};