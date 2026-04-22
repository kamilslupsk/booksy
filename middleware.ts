import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth: authMiddleware } = NextAuth(authConfig);

// Common paths attackers probe for. Return 404 immediately to avoid
// leaking existence and to save compute on downstream rules.
const BLOCKED_PATHS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/wp-(admin|login|content|includes|json)/i,
  /^\/xmlrpc\.php$/i,
  /^\/phpmyadmin/i,
  /^\/(vendor|storage)\/.*\.(php|log)$/i,
  /\.(php|asp|aspx|jsp|cgi)$/i,
  /^\/cgi-bin/i,
  /^\/admin\.php/i,
];

export default authMiddleware((req) => {
  const { pathname } = req.nextUrl;

  for (const re of BLOCKED_PATHS) {
    if (re.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and static files.
  // Authorization for /dashboard, /klient, /admin lives in auth.config.ts.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|map)$).*)",
  ],
};
