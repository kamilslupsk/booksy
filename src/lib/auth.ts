import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "../../auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      id: "email-password",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { provider: { select: { id: true, slug: true } } },
        });

        if (!user?.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          providerId: user.provider?.id,
          providerSlug: user.provider?.slug,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.providerId = user.providerId;
        token.providerSlug = user.providerSlug;
      }
      if (trigger === "update" || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          include: { provider: { select: { id: true, slug: true } } },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.providerId = dbUser.provider?.id;
          token.providerSlug = dbUser.provider?.slug;
        }
      }
      return token;
    },
  },
});
