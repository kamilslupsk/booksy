import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
