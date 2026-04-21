import { prisma } from "./prisma";

export async function requireActiveSubscription(providerId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({ where: { providerId } });

  if (!sub) throw new SubscriptionError("Brak abonamentu.");

  const now = new Date();

  if (sub.status === "TRIAL" && sub.trialEndsAt > now) return;
  if (sub.status === "ACTIVE" && sub.currentPeriodEnd && sub.currentPeriodEnd > now) return;

  throw new SubscriptionError("Abonament wygasł. Odnów abonament, aby kontynuować.");
}

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionError";
  }
}

export function getTrialEndDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
}
