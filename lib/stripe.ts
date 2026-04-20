import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

// Get or create a Stripe customer for an account
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

  const customer = await stripe.customers.create({
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

// Last day of current month timestamp for billing anchor
export function getEndOfMonthTimestamp(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return Math.floor(lastDay.getTime() / 1000);
}
