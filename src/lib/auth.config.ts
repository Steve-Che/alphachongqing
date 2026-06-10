import type { NextAuthConfig } from "next-auth";
import { isPublicPath } from "@/lib/auth-paths";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (!auth && !isPublicPath(pathname)) return false;

      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
};
