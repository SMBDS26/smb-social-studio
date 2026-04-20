import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillingClient } from "@/components/billing/BillingClient";

export default async function BillingPage() {
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      _count: { select: { users: true, brands: true } },
      billingEvents: { orderBy: { occurredAt: "desc" }, take: 5 },
    },
  });

  if (!account) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & account</h1>
      <BillingClient account={account} />
    </div>
  );
}
