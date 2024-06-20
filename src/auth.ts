import NextAuth from "next-auth";
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prismadb";

import authConfig from "@/auth.config";
import { findUserByID } from "./data/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async session({ token, session }) {
      if (!token.sub) return session;
      session.user.id = token.sub;
      if (token.role && session.user) {
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await findUserByID(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },
  },
  // adapter: MongoDBAdapter(clientPromise),
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  ...authConfig,
});
