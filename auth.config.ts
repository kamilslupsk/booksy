import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (pathname.startsWith("/dashboard")) return isLoggedIn;
      if (pathname.startsWith("/klient")) return isLoggedIn;
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "ADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.providerId = user.providerId;
        token.providerSlug = user.providerSlug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.providerId = token.providerId as string | undefined;
        session.user.providerSlug = token.providerSlug as string | undefined;
      }
      return session;
    },
  },
  providers: [],
};
