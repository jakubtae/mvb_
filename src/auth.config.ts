import type { NextAuthConfig, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GoogleProfile } from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { GitHubProfile } from "next-auth/providers/github";
interface CustomUser extends NextAuthUser {
  role: "USER" | "ADMIN";
  sub?: string;
  image?: string;
}

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile: GoogleProfile): CustomUser {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER", // Assigning a valid role
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      profile(profile: GitHubProfile): CustomUser {
        return {
          sub: profile.node_id as string,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url as string,
          role: "USER", // Assigning a valid role
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
