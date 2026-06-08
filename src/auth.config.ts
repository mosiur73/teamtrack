import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname === "/" ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/signup";

      if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isPublicRoute) return true;

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
};
