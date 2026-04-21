import Stripe from "stripe";

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep named export for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export async function getOrCreateStripeCustomer(
  accountId: string,
  email: string,
  name: string
): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { stripeCustomerId: true },
  });

  if (account?.stripeCustomerId) return account.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { accountId },
  });

  await prisma.account.update({
    where: { id: accountId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export function getEndOfMonthTimestamp(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return Math.floor(lastDay.getTime() / 1000);
}
