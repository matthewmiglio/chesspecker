import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true;

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const email = user.email.toLowerCase().trim();

        // Upsert user - insert if not exists, do nothing if exists
        await supabase
          .from("ChessPeckerUsers")
          .upsert(
            { email, tier: "free" },
            { onConflict: "email", ignoreDuplicates: true }
          );
      } catch (error) {
        console.error("Failed to register user in ChessPeckerUsers:", error);
        // Don't block sign-in on failure - the safety check will catch it
      }

      return true;
    },
  },
};
