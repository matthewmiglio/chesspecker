import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { type NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Only export handler functions — DO NOT export authOptions directly
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
