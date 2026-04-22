import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCron } from "@/lib/cron-auth";

export async function GET(req: Request) {
  const unauthorized = verifyCron(req);
  if (unauthorized) return unauthorized;

  const now = new Date();

  // Expire TRIAL subscriptions where trialEndsAt < now
  const expiredTrials = await prisma.subscription.updateMany({
    where: { status: "TRIAL", trialEndsAt: { lt: now } },
    data: { status: "PAST_DUE" },
  });

  // Expire ACTIVE subscriptions where currentPeriodEnd < now
  const expiredActive = await prisma.subscription.updateMany({
    where: { status: "ACTIVE", currentPeriodEnd: { lt: now } },
    data: { status: "PAST_DUE" },
  });

  return NextResponse.json({ expiredTrials: expiredTrials.count, expiredActive: expiredActive.count });
}
