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
      const extendedToken = token as ExtendedJWT;
      if (account?.provider === "google" && (account as GoogleAccount).id_token) {
        const idToken = (account as GoogleAccount).id_token!;

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (!error && data.session) {
          extendedToken.supabase = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user_id: data.user?.id ?? null,
          };
        }
      }

      const supa = extendedToken.supabase;
      if (supa?.access_token && supa?.refresh_token && supa?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (supa.expires_at! - now < 60) {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: supa.refresh_token,
          });
          if (!error && data.session) {
            extendedToken.supabase = {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token ?? supa.refresh_token,
              expires_at: data.session.expires_at,
              user_id: data.user?.id ?? supa.user_id,
            };
          } else {
            delete extendedToken.supabase;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;
      const supa = extendedToken.supabase;
      if (supa?.access_token) {
        extendedSession.supabase = {
          access_token: supa.access_token,
          user_id: supa.user_id,
          expires_at: supa.expires_at,
        };
      }
      return extendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};