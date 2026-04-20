import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (_err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountId = session.metadata?.accountId;
        if (!accountId) break;

        await prisma.account.update({
          where: { id: accountId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "ACTIVE",
          },
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const accountId = subscription.metadata?.accountId;
        if (!accountId) break;

        const sub = subscription as unknown as { current_period_end?: number };

        await prisma.account.update({
          where: { id: accountId },
          data: {
            subscriptionStatus: "ACTIVE",
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });

        await prisma.billingEvent.create({
          data: {
            accountId,
            stripeEventId: event.id,
            type: event.type,
            amountGbp: ((invoice as unknown as { amount_paid?: number }).amount_paid ?? 0) / 100,
            status: "paid",
            occurredAt: new Date(event.created * 1000),
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const accountId = subscription.metadata?.accountId;
        if (!accountId) break;

        await prisma.account.update({
          where: { id: accountId },
          data: { subscriptionStatus: "PAST_DUE" },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = subscription.metadata?.accountId;
        if (!accountId) break;

        await prisma.account.update({
          where: { id: accountId },
          data: { subscriptionStatus: "CANCELED" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
