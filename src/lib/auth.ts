import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "../../auth.config";
import { verifyOtp, normalizePhone } from "./sms";

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
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Telefon", type: "text" },
        code: { label: "Kod OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const code = credentials?.code as string;
        if (!phone || !code) return null;

        const e164 = normalizePhone(phone);
        const valid = await verifyOtp(e164, code);
        if (!valid) return null;

        const user = await prisma.user.upsert({
          where: { phone: e164 },
          update: {},
          create: { phone: e164, role: "CLIENT" },
          include: { provider: { select: { id: true, slug: true } } },
        });

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
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
