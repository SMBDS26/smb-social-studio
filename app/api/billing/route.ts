import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateStripeCustomer, getEndOfMonthTimestamp, STRIPE_PRICE_ID } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    subscriptionStatus: account.subscriptionStatus,
    currentPeriodEnd: account.currentPeriodEnd,
    trialEndsAt: account.trialEndsAt,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;

  const { action } = await req.json();

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const customerId = await getOrCreateStripeCustomer(
    accountId,
    session.user.email!,
    account.name
  );

  if (action === "portal") {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return NextResponse.json({ url: portalSession.url });
  }

  if (action === "checkout") {
    const endOfMonth = getEndOfMonthTimestamp();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        billing_cycle_anchor: endOfMonth,
        proration_behavior: "none",
        metadata: { accountId },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: { accountId },
    });
    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
