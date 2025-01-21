import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      isWorldcoinVerified: boolean;
    } & DefaultSession["user"]
  }
  interface User {
    isWorldcoinVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isWorldcoinVerified: boolean;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET must be set');
}
if (!process.env.WLD_CLIENT_ID) {
  throw new Error('WLD_CLIENT_ID must be set');
}
if (!process.env.WLD_CLIENT_SECRET) {
  throw new Error('WLD_CLIENT_SECRET must be set');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID must be set');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET must be set');
}

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel: profile["https://id.worldcoin.org/v1"].verification_level,
          isWorldcoinVerified: true
        };
      },
    },
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          isWorldcoinVerified: false
        };
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          isWorldcoinVerified: token.isWorldcoinVerified
        }
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.isWorldcoinVerified = user.isWorldcoinVerified;
      }
      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
