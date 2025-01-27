import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SignJWT, jwtVerify } from 'jose';

declare module "next-auth" {
  interface Session {
    customToken?: string
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
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const WorldcoinProvider = {
  id: "worldcoin",
  name: "Worldcoin",
  type: "oauth" as const,
  wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
  authorization: { params: { scope: "openid" } },
  clientId: process.env.WLD_CLIENT_ID,
  clientSecret: process.env.WLD_CLIENT_SECRET,
  idToken: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.sub,
      email: profile.email
    };
  },
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    WorldcoinProvider
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        // Sign a custom JWT token
        const customToken = await new SignJWT(token)
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('24h')
          .sign(secret);
        token.customToken = customToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.customToken) {
        session.customToken = token.customToken as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    async encode({ token }) {
      return await new SignJWT(token)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);
    },
    async decode({ token }) {
      try {
        const { payload } = await jwtVerify(token!, secret);
        return payload;
      } catch {
        return null;
      }
    },
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
