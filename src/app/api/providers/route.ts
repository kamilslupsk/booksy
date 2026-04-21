import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTrialEndDate } from "@/lib/subscription";
import { generateReferralCode as generateCode } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, category, slug: rawSlug } = await req.json();

  let slug = rawSlug;
  const existing = await prisma.provider.findUnique({ where: { slug } });
  if (existing) {
    slug = `${rawSlug}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  const referralCode = generateCode(displayName);

  const provider = await prisma.provider.create({
    data: {
      userId: session.user.id,
      slug,
      displayName,
      category,
      isActive: true,
      subscription: {
        create: {
          status: "TRIAL",
          trialEndsAt: getTrialEndDate(),
        },
      },
      referralLink: {
        create: { code: referralCode },
      },
    },
  });

  // Upgrade user role to PROVIDER
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "PROVIDER" },
  });

  return NextResponse.json({ providerId: provider.id, slug: provider.slug });
}
